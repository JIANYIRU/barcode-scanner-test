console.log("scan.js v12 已載入");

document.addEventListener("DOMContentLoaded", init);


// 暫存最近查到的商品，下一步加入商品列表時會使用
let currentProduct = null;
let orderItems = [];

/**
 * 初始化新增抄貨單頁面
 */
function init() {
  renderOrderInfo();
  bindEvents();
  loadCurrentOrder();
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
    .addEventListener("click", function () {
      alert("完成抄貨功能開發中");
    });
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

/**
 * 暫存整張抄貨單
 */
function handleSaveOrder() {
  if (orderItems.length === 0) {
    alert("目前沒有商品可以暫存。");
    return;
  }

  const result =
    saveCurrentOrder();

  if (!result.success) {
    alert(
      result.message || "暫存失敗。"
    );
    return;
  }

  alert("抄貨單已暫存。");
}












