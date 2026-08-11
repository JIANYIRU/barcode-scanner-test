document.addEventListener(
  "DOMContentLoaded",
  loadHistoryDetail
);


/**
 * ==========================================
 * 歷史抄貨明細
 * ==========================================
 */


/**
 * 讀取指定歷史抄貨單
 */
async function loadHistoryDetail() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const orderId =
    params.get("id") || "";

  const header =
    document.getElementById(
      "historyDetailHeader"
    );

  const list =
    document.getElementById(
      "historyDetailList"
    );

  if (!orderId) {

    header.textContent =
      "找不到抄貨單 ID。";

    return;
  }

  try {

    const result =
      await api(
        "getHistoryOrders"
      );

    if (
      !result.success ||
      !Array.isArray(result.orders)
    ) {

      throw new Error(
        result.message ||
        "讀取歷史資料失敗。"
      );

    }

    const order =
      result.orders.find(
        function (item) {

          return (
            String(item.id) ===
            String(orderId)
          );

        }
      );

    if (!order) {

      throw new Error(
        "找不到這張歷史抄貨單。"
      );

    }

    renderHistoryDetail(
      order
    );

  } catch (error) {

    console.error(
      "讀取歷史明細失敗：",
      error
    );

    header.textContent =
      `讀取失敗：${error.message}`;

    list.innerHTML = "";
  }
}


/**
 * 顯示歷史抄貨單基本資料與商品
 */
function renderHistoryDetail(order) {

  const header =
    document.getElementById(
      "historyDetailHeader"
    );

  const list =
    document.getElementById(
      "historyDetailList"
    );

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  header.innerHTML = `
    <div class="print-detail-info">

      <strong>
        ${escapeHistoryDetailHtml(order.channel)}
        ${escapeHistoryDetailHtml(order.branch)}
      </strong>

      <span>
        日期：
        ${escapeHistoryDetailHtml(
          formatHistoryDetailDate(
            order.date
          )
        )}
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
      String(
        item.remark || ""
      ).trim() !== "";

    row.className =
      hasRemark
        ? "print-detail-row print-detail-row-warning"
        : "print-detail-row";

    row.innerHTML = `
      <div class="print-detail-barcode">
        ${escapeHistoryDetailHtml(item.barcode)}
      </div>

      <div class="print-detail-name">
        ${escapeHistoryDetailHtml(item.name)}
      </div>

      <div class="print-detail-quantity">
        ${item.quantity}
      </div>

      <div class="print-detail-remark">
        ${
          hasRemark
            ? `📝 ${escapeHistoryDetailHtml(item.remark)}`
            : ""
        }
      </div>
    `;

    list.appendChild(
      row
    );

  });
}


/**
 * 日期統一顯示 yyyy-mm-dd
 */
function formatHistoryDetailDate(value) {

  const parts =
    String(value || "")
      .trim()
      .split(/[\/\-]/);

  if (parts.length !== 3) {
    return value || "";
  }

  const year =
    parts[0];

  const month =
    String(parts[1])
      .padStart(2, "0");

  const day =
    String(parts[2])
      .padStart(2, "0");

  return (
    `${year}-${month}-${day}`
  );
}


/**
 * HTML 安全處理
 */
function escapeHistoryDetailHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
