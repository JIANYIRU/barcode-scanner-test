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
    const row = document.createElement("div");

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
      button.addEventListener("click", function () {
        const index = Number(button.dataset.index);
        editOrderItem(index);
      });
    });

  document
    .querySelectorAll(".delete-item-button")
    .forEach(function (button) {
      button.addEventListener("click", function () {
        const index = Number(button.dataset.index);
        deleteOrderItem(index);
      });
    });
}

/**
 * 修改商品數量與備註
 */
function editOrderItem(index) {
  const item = orderItems[index];

  if (!item) {
    return;
  }

  const newQuantity = window.prompt(
    `修改「${item.name}」的數量`,
    String(item.quantity)
  );

  if (newQuantity === null) {
    return;
  }

  const newRemark = window.prompt(
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
  saveOrderItems();
}

/**
 * 刪除整筆商品
 */
function deleteOrderItem(index) {
  const item = orderItems[index];

  if (!item) {
    return;
  }

  const confirmed = window.confirm(
    `確定要刪除「${item.name}」嗎？`
  );

  if (!confirmed) {
    return;
  }

  orderItems.splice(index, 1);

  renderProductList();
  saveOrderItems();
}
