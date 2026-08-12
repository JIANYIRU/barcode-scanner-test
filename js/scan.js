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

  const existingDraftId =
    params.get("draftId") || "";

  if (existingDraftId) {
    // 從「進行中的抄貨」回來
    currentDraftId = existingDraftId;

    loadCurrentOrder(currentDraftId);

  } else {
    // 全新抄貨單：
    // 一進頁面就先給它獨立 ID
    currentDraftId = createDraftId();

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
.addEventListener(
  "click",
  openManualSearch
);

document
.getElementById("closeManualSearchButton")
.addEventListener(
  "click",
  closeManualSearch
);

  document
.getElementById("manualSearchSubmitButton")
.addEventListener(
  "click",
  searchManualProducts
);

  document
.getElementById("manualSearchKeyword")
.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Enter") {
      event.preventDefault();
      searchManualProducts();
    }

  }
);

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
 * 開啟手動輸入條碼搜尋區
 */
function openManualSearch() {

  const manualSearchArea =
    document.getElementById(
      "manualSearchArea"
    );

  const manualSearchKeyword =
    document.getElementById(
      "manualSearchKeyword"
    );

  /*
   * 開啟手動搜尋時，
   * 如果相機目前開著就先關閉。
   */
  closeCamera();

  manualSearchArea.hidden = false;
  manualSearchArea.style.display = "block";

  /*
   * 每次重新開啟時
   * 先把搜尋框清空。
   */
  manualSearchKeyword.value = "";

  document
    .getElementById(
      "manualSearchResult"
    )
    .innerHTML = "";

  document
    .getElementById(
      "addManualSelectedButton"
    )
    .hidden = true;

  /*
   * 游標直接進入搜尋框
   */
  manualSearchKeyword.focus();
}


/**
 * 關閉手動輸入條碼搜尋區
 */
function closeManualSearch() {

  const manualSearchArea =
    document.getElementById(
      "manualSearchArea"
    );

  manualSearchArea.hidden = true;
  manualSearchArea.style.display = "none";

  document
    .getElementById(
      "manualSearchKeyword"
    )
    .value = "";

  document
    .getElementById(
      "manualSearchResult"
    )
    .innerHTML = "";

  document
    .getElementById(
      "addManualSelectedButton"
    )
    .hidden = true;
}


/**
 * 手動輸入條碼－搜尋商品
 */
async function searchManualProducts() {

  const keywordInput =
    document.getElementById(
      "manualSearchKeyword"
    );

  const resultArea =
    document.getElementById(
      "manualSearchResult"
    );

  const keyword =
    String(keywordInput.value || "")
      .trim();

  if (!keyword) {
    alert("請輸入商品名稱或條碼。");
    keywordInput.focus();
    return;
  }

  resultArea.innerHTML =
    "<p>搜尋中...</p>";

  try {

    const result =
      await api(
        "searchProducts",
        {
          keyword: keyword
        }
      );

    console.log(
      "手動商品搜尋結果：",
      result
    );

    if (
      !result.success ||
      !Array.isArray(result.products)
    ) {
      throw new Error(
        result.message ||
        "商品搜尋失敗。"
      );
    }

    if (result.products.length === 0) {

      resultArea.innerHTML =
        "<p>查無符合的商品。</p>";

      return;
    }

    renderManualSearchResults(
      result.products
    );

  } catch (error) {

    console.error(
      "手動商品搜尋失敗：",
      error
    );

    resultArea.innerHTML =
      `<p>商品搜尋失敗：${escapeHtml(error.message)}</p>`;

  }
}


/**
 * 顯示手動商品搜尋結果
 */
function renderManualSearchResults(products) {

  const resultArea =
    document.getElementById(
      "manualSearchResult"
    );

  resultArea.innerHTML = "";

  products.forEach(function (product, index) {

    const row =
      document.createElement("div");

    row.className =
      "manual-product-row";

    row.innerHTML = `
      <label class="manual-product-main">

        <input
          class="manual-product-checkbox"
          type="checkbox"
          data-index="${index}"
        >

        <span class="manual-product-barcode">
          ${escapeHtml(product.barcode)}
        </span>

        <span class="manual-product-name">
          ${escapeHtml(product.name)}
        </span>

      </label>

      <div
        class="manual-product-edit"
        data-index="${index}"
        hidden>

        <span class="manual-quantity-label">
          數量
        </span>

        <button
          class="manual-minus-button"
          type="button"
          data-index="${index}">
          −
        </button>

        <input
          class="manual-quantity-input"
          type="number"
          min="1"
          value="1"
          data-index="${index}"
        >

        <button
          class="manual-plus-button"
          type="button"
          data-index="${index}">
          ＋
        </button>

        <span class="manual-remark-label">
          備註
        </span>

        <input
          class="manual-remark-input"
          type="text"
          placeholder="可略過"
          data-index="${index}"
        >

      </div>
    `;

    /*
     * 暫存這筆商品資料，
     * 之後加入抄貨列表時會使用。
     */
    row.dataset.barcode =
      product.barcode || "";

    row.dataset.name =
      product.name || "";

    resultArea.appendChild(row);

  });

  bindManualSearchResultEvents();
}

/**
 * 綁定手動搜尋結果事件
 */
function bindManualSearchResultEvents() {

  document
    .querySelectorAll(
      ".manual-product-checkbox"
    )
    .forEach(function (checkbox) {

      checkbox.addEventListener(
        "change",
        function () {

          const index =
            checkbox.dataset.index;

          const editArea =
            document.querySelector(
              `.manual-product-edit[data-index="${index}"]`
            );

          if (!editArea) {
            return;
          }

          editArea.hidden =
            !checkbox.checked;

          updateManualAddButton();
        }
      );

    });
}


/**
 * 控制「加入商品列表」按鈕
 */
function updateManualAddButton() {

  const hasSelected =
    document.querySelector(
      ".manual-product-checkbox:checked"
    );

  const button =
    document.getElementById(
      "addManualSelectedButton"
    );

  button.hidden =
    !hasSelected;
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
productPreview.style.display = "block";
  
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

  const params =
    new URLSearchParams(window.location.search);

  const channel =
    params.get("channel") || "";

  const branch =
    params.get("branch") || "";

  const date =
    params.get("date") || "";

  /*
   * 直接使用目前畫面上的真正資料，
   * 不使用任何測試資料。
   */
  const currentOrder = {
    id: currentDraftId,
    channel: channel,
    branch: branch,
    date: date,
    items: orderItems.map(function (item) {
      return {
        barcode: item.barcode,
        name: item.name,
        quantity: item.quantity,
        remark: item.remark || ""
      };
    })
  };

  const confirmed =
    window.confirm(
      `確定要完成這張抄貨單嗎？\n\n` +
      `通路：${channel}\n` +
      `店家：${branch}\n` +
      `商品：${orderItems.length} 項\n\n` +
      `抄貨單ID：${currentDraftId}`
    );

  if (!confirmed) {
    return;
  }

  const completeButton =
    document.getElementById("completeButton");

  completeButton.disabled = true;
  completeButton.textContent = "完成中…";

  try {

    /*
     * 先把目前最新狀態存進暫存。
     */
    const saveResult =
      saveCurrentOrder(currentDraftId);

    if (!saveResult.success) {
      throw new Error(
        saveResult.message ||
        "無法儲存目前抄貨單。"
      );
    }

    /*
     * 將眼前這一張正式送到 Apps Script
     */
    console.log(
      "即將完成的抄貨單：",
      currentOrder
    );

    const result =
      await apiPost(
        "completeOrder",
        {
          order: currentOrder
        }
      );

    console.log(
      "完成抄貨 API 回應：",
      result
    );

    if (!result.success) {
      throw new Error(
        result.message ||
        "完成抄貨失敗。"
      );
    }

    /*
     * Google Sheets 寫入成功後
     * 才移除這張暫存單。
     */
    clearCurrentOrder(
      currentDraftId
    );

    alert(
      `抄貨完成！\n共完成 ${
        result.itemCount || orderItems.length
      } 項商品。`
    );

    window.location.href =
      "index.html";

  } catch (error) {

    console.error(
      "完成抄貨失敗：",
      error
    );

    alert(
      `完成抄貨失敗：${error.message}\n\n` +
      `暫存資料仍然保留，可以稍後再試。`
    );

    completeButton.disabled = false;
    completeButton.textContent =
      "完成抄貨";
  }
}


