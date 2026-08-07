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
    testCompleteOrderApi
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

async function testCompleteOrderApi() {
  const testOrder = {
    id: "WEB-TEST-001",
    date: "2026-08-07",
    channel: "小點",
    branch: "中華店",
    items: [
      {
        barcode: "4710126398221",
        name: "義美草莓乾",
        quantity: 3,
        remark: "前端測試"
      }
    ]
  };

  try {
    const result = await apiPost(
      "completeOrder",
      {
        order: testOrder
      }
    );

    console.log(
      "完成抄貨 API 測試結果：",
      result
    );

    alert(
      result.message ||
      "API 測試完成"
    );

  } catch (error) {
    console.error(
      "完成抄貨 API 測試失敗：",
      error
    );

    alert(
      `測試失敗：${error.message}`
    );
  }
}





