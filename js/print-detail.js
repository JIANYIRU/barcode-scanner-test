document.addEventListener(
  "DOMContentLoaded",
  function () {
    loadOrderDetail();
    bindArchiveOrderButton();
  }
);

/**
 * ==========================================
 * 抄貨單明細
 * ==========================================
 */

/**
 * 讀取單張抄貨單
 */
async function loadOrderDetail() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const orderId =
    params.get("id") || "";

  const header =
    document.getElementById(
      "orderDetailHeader"
    );

  const list =
    document.getElementById(
      "orderDetailList"
    );

  if (!orderId) {

    header.innerHTML =
      "缺少抄貨單 ID。";

    return;
  }

  try {

    const result =
      await api(
        "getCompletedOrderById",
        {
          orderId: orderId
        }
      );

    if (
      !result.success ||
      !result.order
    ) {
      throw new Error(
        result.message ||
        "讀取抄貨單失敗。"
      );
    }

    renderOrderDetail(
      result.order
    );

  } catch (error) {

    console.error(
      "讀取抄貨單明細失敗：",
      error
    );

    header.innerHTML =
      "抄貨單讀取失敗。";

    list.innerHTML = "";
  }
}


/**
 * 顯示抄貨單基本資料與商品
 */
function renderOrderDetail(order) {

  const header =
    document.getElementById(
      "orderDetailHeader"
    );

  const list =
    document.getElementById(
      "orderDetailList"
    );

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  header.innerHTML = `
    <div class="print-detail-info">

      <strong>
        ${escapeDetailHtml(order.channel)}
        ${escapeDetailHtml(order.branch)}
      </strong>

      <span>
        日期：${escapeDetailHtml(order.date)}
      </span>

      <span>
        商品：${items.length} 項
      </span>

    </div>
  `;

  list.innerHTML = "";

  items.forEach(function (item) {

    const row =
      document.createElement("div");

    const hasRemark =
      String(item.remark || "").trim() !== "";

    row.className = hasRemark
      ? "print-detail-row print-detail-row-warning"
      : "print-detail-row";

row.innerHTML = `
  <div class="print-detail-barcode">
    ${escapeDetailHtml(item.barcode)}
  </div>

  <div class="print-detail-name">
    ${escapeDetailHtml(item.name)}
  </div>

  <div class="print-detail-quantity">
    ${item.quantity}
  </div>

  <div class="print-detail-remark">
    ${
      hasRemark
        ? `📝 ${escapeDetailHtml(item.remark)}`
        : ""
    }
  </div>

 <div class="print-detail-action">

  <button
    class="edit-completed-item-button"
    type="button"
    data-order-id="${escapeDetailHtml(order.id)}"
    data-barcode="${escapeDetailHtml(item.barcode)}"
    data-name="${escapeDetailHtml(item.name)}"
    data-quantity="${item.quantity}"
    data-remark="${escapeDetailHtml(item.remark || "")}">
    修改
  </button>

  <button
    class="delete-completed-item-button"
    type="button"
    data-order-id="${escapeDetailHtml(order.id)}"
    data-barcode="${escapeDetailHtml(item.barcode)}"
    data-name="${escapeDetailHtml(item.name)}">
    刪除
  </button>

</div>
`;

    list.appendChild(row);
  });

bindCompletedItemEditEvents();
bindCompletedItemDeleteEvents();  
  
}

/**
 * 綁定已完成商品修改按鈕
 */
function bindCompletedItemEditEvents() {

  document
    .querySelectorAll(
      ".edit-completed-item-button"
    )
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          editCompletedItem(button);

        }
      );

    });
}

/**
 * 綁定已完成商品刪除按鈕
 */
function bindCompletedItemDeleteEvents() {

  document
    .querySelectorAll(
      ".delete-completed-item-button"
    )
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          deleteCompletedItem(button);

        }
      );

    });
}

/**
 * 修改已完成抄貨商品
 */
async function editCompletedItem(button) {

  const orderId =
    button.dataset.orderId || "";

  const barcode =
    button.dataset.barcode || "";

  const name =
    button.dataset.name || "";

  const oldQuantity =
    button.dataset.quantity || "1";

  const oldRemark =
    button.dataset.remark || "";

  const newQuantity =
    window.prompt(
      `修改「${name}」的數量`,
      oldQuantity
    );

  if (newQuantity === null) {
    return;
  }

  const quantity =
    Number(newQuantity);

  if (
    !Number.isFinite(quantity) ||
    quantity < 1
  ) {
    alert("請輸入正確的商品數量。");
    return;
  }

  const newRemark =
    window.prompt(
      `修改「${name}」的備註`,
      oldRemark
    );

  if (newRemark === null) {
    return;
  }

  button.disabled = true;
  button.textContent = "修改中…";

  try {

    const result =
      await apiPost(
        "updateCompletedOrderItem",
        {
          data: {
            orderId: orderId,
            barcode: barcode,
            quantity: quantity,
            remark: newRemark.trim()
          }
        }
      );

    console.log(
      "修改已完成商品結果：",
      result
    );

    if (!result.success) {
      throw new Error(
        result.message ||
        "修改失敗。"
      );
    }

    alert("修改成功。");

    // 重新讀取 Google Sheets 最新資料
    await loadOrderDetail();

  } catch (error) {

    console.error(
      "修改商品失敗：",
      error
    );

    alert(
      `修改失敗：${error.message}`
    );

    button.disabled = false;
    button.textContent = "修改";
  }
}

/**
 * 刪除已完成抄貨商品
 */
async function deleteCompletedItem(button) {

  const orderId =
    button.dataset.orderId || "";

  const barcode =
    button.dataset.barcode || "";

  const name =
    button.dataset.name || "";

  const confirmed =
    window.confirm(
      `確定要刪除「${name}」嗎？`
    );

  if (!confirmed) {
    return;
  }

  button.disabled = true;
  button.textContent = "刪除中…";

  try {

    const result =
      await apiPost(
        "deleteCompletedOrderItem",
        {
          data: {
            orderId: orderId,
            barcode: barcode
          }
        }
      );

    console.log(
      "刪除已完成商品結果：",
      result
    );

    if (!result.success) {
      throw new Error(
        result.message ||
        "刪除失敗。"
      );
    }

    alert("商品已刪除。");

    // 重新讀取 Google Sheets 最新資料
    await loadOrderDetail();

  } catch (error) {

    console.error(
      "刪除商品失敗：",
      error
    );

    alert(
      `刪除失敗：${error.message}`
    );

    button.disabled = false;
    button.textContent = "刪除";
  }
}

/**
 * HTML 安全處理
 */
function escapeDetailHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 綁定確認建檔按鈕
 */
function bindArchiveOrderButton() {

  const button =
    document.getElementById(
      "archiveOrderButton"
    );

  if (!button) {
    return;
  }

  button.addEventListener(
    "click",
    handleArchiveOrder
  );
}

/**
 * 確認建檔目前抄貨單
 */
async function handleArchiveOrder() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const orderId =
    params.get("id") || "";

  if (!orderId) {
    alert("找不到抄貨單 ID。");
    return;
  }

  const confirmed =
    window.confirm(
      "建檔後這張抄貨單會移入歷史資料，並從待建檔清單移除。\n\n確定要建檔嗎？"
    );

  if (!confirmed) {
    return;
  }

  const button =
    document.getElementById(
      "archiveOrderButton"
    );

  button.disabled = true;
  button.textContent = "建檔中…";

  try {

    const result =
      await apiPost(
        "archiveCompletedOrder",
        {
          orderId: orderId
        }
      );

    console.log(
      "建檔結果：",
      result
    );

    if (!result.success) {
      throw new Error(
        result.message ||
        "建檔失敗。"
      );
    }

    alert(
      `建檔成功！\n共 ${result.itemCount || 0} 項商品。`
    );

    window.location.href =
      "print.html";

  } catch (error) {

    console.error(
      "建檔失敗：",
      error
    );

    alert(
      `建檔失敗：${error.message}`
    );

    button.disabled = false;
    button.textContent =
      "確認建檔";
  }
}

