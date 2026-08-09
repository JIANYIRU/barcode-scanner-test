document.addEventListener(
  "DOMContentLoaded",
  loadOrderDetail
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
    `;

    list.appendChild(row);
  });
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
