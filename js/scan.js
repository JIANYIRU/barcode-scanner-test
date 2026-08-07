console.log("scan.js v12 已載入");

document.addEventListener("DOMContentLoaded", init);


// 暫存最近查到的商品，下一步加入商品列表時會使用
let currentProduct = null;
let orderItems = [];

// 目前正在編輯的暫存抄貨單 ID
let currentDraftId = "";

/**
 * 初始化新增抄貨單頁面
 */
function init() {
  renderOrderInfo();
  bindEvents();

  migrateOldCurrentOrder();

  const params =
    new URLSearchParams(window.location.search);

  currentDraftId =
    params.get("draftId") || "";

  if (currentDraftId) {
    loadCurrentOrder(currentDraftId);
  } else {
    orderItems = [];
    currentProduct = null;
    renderProductList();
  }
}

/**
 * 顯示通路、店家與日期
 */
function renderOrderInfo() {
  const params = new URLSearchParams(window.location.search);

  const channel = params.get("channel") || "";
  const branch = params.get("branch") || "";
  const date = params.get("date") || "";

  document.getElementById("orderInfo").innerHTML = `
    <span><strong>通路：</strong>${escapeHtml(channel)}</span>
    <span><strong>店家：</strong>${escapeHtml(branch)}</span>
    <span><strong>日期：</strong>${escapeHtml(date)}</span>
  `;
}

/**
 * 綁定按鈕事件
 */
function bindEvents() {

document
  .getElementById("addProductButton")
  .addEventListener("click", addProductToList);  
  
document
  .getElementById("minusButton")
  .addEventListener("click", decreaseQuantity);

document
  .getElementById("plusButton")
  .addEventListener("click", increaseQuantity);

document
  .getElementById("quantityInput")
  .addEventListener("change", normalizeQuantity);
  
document
  .getElementById("zoomSlider")
  .addEventListener("input", changeCameraZoom);
  
  document
    .getElementById("scanButton")
    .addEventListener("click", openCamera);

  document
    .getElementById("closeCameraButton")
    .addEventListener("click", closeCamera);

  document
    .getElementById("manualButton")
    .addEventListener("click", function () {
      alert("手動輸入條碼功能稍後開發");
    });

  document
  .getElementById("saveButton")
  .addEventListener(
    "click",
    handleSaveOrder
  );

  document
  .getElementById("completeButton")
  .addEventListener(
    "click",
    handleCompleteOrder
  );
}


/**
 * 顯示商品辨識結果
 */
function showProductPreview(product) {
  const productPreview =
    document.getElementById("productPreview");

  const previewBarcode =
    document.getElementById("previewBarcode");

  const previewName =
    document.getElementById("previewName");

  previewBarcode.textContent =
    product.barcode || "";

  previewName.textContent =
    product.name || "";

document.getElementById("quantityInput").value = 1;
document.getElementById("remarkInput").value = "";
  
  productPreview.hidden = false;
}

function handleSaveOrder() {
  if (orderItems.length === 0) {
    alert("目前沒有商品可以暫存。");
    return;
  }

  const result =
    saveCurrentOrder(currentDraftId);

  if (!result.success) {
    alert(
      result.message || "暫存失敗。"
    );
    return;
  }

  // 新單第一次儲存後，記住它的 ID
  currentDraftId = result.draftId;

  alert("抄貨單已暫存。");

  window.location.href = "index.html";
}

/**
 * ==========================================
 * 完成抄貨
 * ==========================================
 */

/**
 * 完成目前抄貨單
 */
async function handleCompleteOrder() {

  if (orderItems.length === 0) {
    alert("目前沒有商品可以完成抄貨。");
    return;
  }

  const confirmed =
    window.confirm(
      `確定要完成這張抄貨單嗎？\n\n共 ${orderItems.length} 項商品`
    );

  if (!confirmed) {
    return;
  }

  const completeButton =
    document.getElementById("completeButton");

  // 防止連續點擊
  completeButton.disabled = true;
  completeButton.textContent = "完成中…";

  try {

    /*
     * 先把目前最新資料存進暫存。
     * 同時確保新開的抄貨單也一定有 draftId。
     */
    const saveResult =
      saveCurrentOrder(currentDraftId);

    if (!saveResult.success) {
      throw new Error(
        saveResult.message ||
        "無法建立抄貨單資料。"
      );
    }

    currentDraftId =
      saveResult.draftId;

    const currentOrder =
      saveResult.order;

    /*
     * 將完整抄貨單送到 Apps Script
     */
    const result =
      await apiPost(
        "completeOrder",
        {
          order: currentOrder
        }
      );

    console.log(
      "完成抄貨結果：",
      result
    );

    /*
     * Google Sheets 沒有確認成功
     * → 暫存單絕對不能刪除
     */
    if (!result.success) {
      throw new Error(
        result.message ||
        "完成抄貨失敗。"
      );
    }

    /*
     * Google Sheets 已確認寫入成功
     * → 才刪除本機這一張暫存單
     */
    clearCurrentOrder(
      currentDraftId
    );

    alert(
      `抄貨完成！\n共完成 ${result.itemCount || orderItems.length} 項商品。`
    );

    // 回首頁
    window.location.href =
      "index.html";

  } catch (error) {

    console.error(
      "完成抄貨失敗：",
      error
    );

    alert(
      `完成抄貨失敗：${error.message}\n\n暫存資料仍然保留，可以稍後再試。`
    );

    // 失敗才恢復按鈕
    completeButton.disabled = false;
    completeButton.textContent =
      "完成抄貨";
  }
}



