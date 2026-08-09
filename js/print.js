document.addEventListener(
  "DOMContentLoaded",
  loadCompletedOrders
);

/**
 * ==========================================
 * 抄貨打單
 * ==========================================
 */

/**
 * 讀取已完成抄貨單
 */
async function loadCompletedOrders() {

  const printOrderList =
    document.getElementById("printOrderList");

  try {

    const result =
      await api("getCompletedOrders");

    if (
      !result.success ||
      !Array.isArray(result.orders)
    ) {
      throw new Error(
        result.message ||
        "讀取抄貨單失敗。"
      );
    }

    renderCompletedOrders(
      result.orders
    );

  } catch (error) {

    console.error(
      "讀取抄貨打單資料失敗：",
      error
    );

    printOrderList.innerHTML = `
      <p class="empty-draft-message">
        讀取抄貨資料失敗。
      </p>
    `;
  }
}


/**
 * 顯示所有已完成抄貨單
 */
function renderCompletedOrders(orders) {

  const printOrderList =
    document.getElementById("printOrderList");

  if (orders.length === 0) {

    printOrderList.innerHTML = `
      <p class="empty-draft-message">
        目前沒有可打單的抄貨資料。
      </p>
    `;

    return;
  }

  printOrderList.innerHTML = "";

  orders.forEach(function (order) {

    const card =
      document.createElement("div");

    card.className =
      "print-order-card";

    const itemCount =
      Array.isArray(order.items)
        ? order.items.length
        : 0;

    card.innerHTML = `
      <div class="print-order-main">

        <strong>
          ${escapePrintHtml(order.channel)}
        </strong>

        <span>
          ${escapePrintHtml(order.branch)}
        </span>

      </div>

      <div class="print-order-meta">

        <span>
          ${escapePrintHtml(order.date)}
        </span>

        <span>
          ${itemCount} 項
        </span>

      </div>

<a
  class="view-print-order-button"
  href="print-detail.html?id=${encodeURIComponent(order.id)}">
  查看
</a>
    `;

    printOrderList.appendChild(card);
  });

}


/**
 * HTML 安全處理
 */
function escapePrintHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
