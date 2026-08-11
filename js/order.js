/**
 * ==========================================
 * 抄貨商品列表
 * ==========================================
 */


/**
 * 顯示抄貨商品列表
 */
function renderProductList() {

  const productList =
    document.getElementById("productList");

  productList.innerHTML = "";

  orderItems.forEach(function (item, index) {

    const row =
      document.createElement("div");

    const hasRemark =
      String(item.remark || "").trim() !== "";

    row.className = hasRemark
      ? "order-item order-item-warning"
      : "order-item";

    row.innerHTML = `
      <span class="order-barcode">
        ${escapeHtml(item.barcode)}
      </span>

      <span class="order-name">
        ${escapeHtml(item.name)}
      </span>

      <span class="order-quantity">
        ${item.quantity}
      </span>

      <span class="order-remark">
        ${
          hasRemark
            ? `📝 ${escapeHtml(item.remark)}`
            : ""
        }
      </span>

      <button
        class="edit-item-button"
        type="button"
        data-index="${index}">
        修改
      </button>

      <button
        class="delete-item-button"
        type="button"
        data-index="${index}">
        刪除
      </button>
    `;

    productList.appendChild(row);
  });

  bindProductListEvents();
}


/**
 * 綁定商品列表按鈕
 */
function bindProductListEvents() {

  document
    .querySelectorAll(".edit-item-button")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const index =
            Number(button.dataset.index);

          editOrderItem(index);

        }
      );

    });


  document
    .querySelectorAll(".delete-item-button")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const index =
            Number(button.dataset.index);

          deleteOrderItem(index);

        }
      );

    });
}


/**
 * 修改商品數量與備註
 */
function editOrderItem(index) {

  const item =
    orderItems[index];

  if (!item) {
    return;
  }

  const newQuantity =
    window.prompt(
      `修改「${item.name}」的數量`,
      String(item.quantity)
    );

  if (newQuantity === null) {
    return;
  }

  const newRemark =
    window.prompt(
      `修改「${item.name}」的備註`,
      item.remark || ""
    );

  if (newRemark === null) {
    return;
  }

  item.quantity =
    getValidQuantity(newQuantity);

  item.remark =
    newRemark.trim();

  renderProductList();

  const result =
    saveCurrentOrder(currentDraftId);

  if (result.success) {
    currentDraftId =
      result.draftId;
  }
}


/**
 * 刪除整筆商品
 */
function deleteOrderItem(index) {

  const item =
    orderItems[index];

  if (!item) {
    return;
  }

  const confirmed =
    window.confirm(
      `確定要刪除「${item.name}」嗎？`
    );

  if (!confirmed) {
    return;
  }

  orderItems.splice(
    index,
    1
  );

  renderProductList();

  const result =
    saveCurrentOrder(currentDraftId);

  if (result.success) {
    currentDraftId =
      result.draftId;
  }
}


/**
 * ==========================================
 * 商品加入與數量控制
 * ==========================================
 */


/**
 * 將已辨識商品加入抄貨列表
 */
function addProductToList() {

  if (!currentProduct) {

    alert(
      "目前沒有已辨識的商品。"
    );

    return;
  }

  const quantity =
    getValidQuantity(
      document
        .getElementById("quantityInput")
        .value
    );

  const remark =
    document
      .getElementById("remarkInput")
      .value
      .trim();

  /*
   * 檢查商品是否已存在
   */
  const existingItem =
    orderItems.find(function (item) {

      return (
        String(item.barcode) ===
        String(currentProduct.barcode)
      );

    });

  /*
   * 同一商品不能新增第二筆，
   * 直接累加原本數量。
   */
  if (existingItem) {

    existingItem.quantity +=
      quantity;

    if (remark) {
      existingItem.remark =
        remark;
    }

  } else {

    orderItems.push({
      barcode:
        currentProduct.barcode,

      name:
        currentProduct.name,

      quantity:
        quantity,

      remark:
        remark
    });

  }

  /*
   * 更新畫面
   */
  renderProductList();

  /*
   * 自動暫存目前抄貨單
   */
  const result =
    saveCurrentOrder(
      currentDraftId
    );

  if (result.success) {

    currentDraftId =
      result.draftId;

  }

  /*
   * 商品已加入列表，
   * 清空並隱藏上方商品新增區
   */
  clearProductPreview();
}


/**
 * 清空商品辨識區
 */
function clearProductPreview() {

  currentProduct = null;

  const productPreview =
    document.getElementById(
      "productPreview"
    );

  if (productPreview) {

    productPreview.hidden =
      true;

    productPreview.style.display =
      "none";

  }

  const quantityInput =
    document.getElementById(
      "quantityInput"
    );

  if (quantityInput) {
    quantityInput.value = 1;
  }

  const remarkInput =
    document.getElementById(
      "remarkInput"
    );

  if (remarkInput) {
    remarkInput.value = "";
  }

  console.log(
    "商品新增區已清空並隱藏"
  );
}


/**
 * 數量減 1，最低為 1
 */
function decreaseQuantity() {

  const quantityInput =
    document.getElementById(
      "quantityInput"
    );

  const quantity =
    getValidQuantity(
      quantityInput.value
    );

  quantityInput.value =
    Math.max(
      1,
      quantity - 1
    );
}


/**
 * 數量加 1
 */
function increaseQuantity() {

  const quantityInput =
    document.getElementById(
      "quantityInput"
    );

  const quantity =
    getValidQuantity(
      quantityInput.value
    );

  quantityInput.value =
    quantity + 1;
}


/**
 * 修正直接輸入的數量
 */
function normalizeQuantity() {

  const quantityInput =
    document.getElementById(
      "quantityInput"
    );

  quantityInput.value =
    getValidQuantity(
      quantityInput.value
    );
}
