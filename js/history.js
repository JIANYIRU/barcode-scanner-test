document.addEventListener(
  "DOMContentLoaded",
  initHistoryPage
);


/**
 * ==========================================
 * 歷史資料
 * ==========================================
 */

let historyOrders = [];


/**
 * 初始化歷史資料頁
 */
async function initHistoryPage() {

  bindHistoryEvents();

  await loadHistoryOrders();
}


/**
 * 綁定歷史頁事件
 */
function bindHistoryEvents() {

  const channelSelect =
    document.getElementById(
      "historyChannel"
    );

  const branchSelect =
    document.getElementById(
      "historyBranch"
    );

  channelSelect.addEventListener(
    "change",
    function () {

      updateHistoryBranchOptions();

      renderFilteredHistoryOrders();
    }
  );

  branchSelect.addEventListener(
    "change",
    renderFilteredHistoryOrders
  );
}


/**
 * 從 Apps Script 讀取最近三個月歷史資料
 */
async function loadHistoryOrders() {

  const list =
    document.getElementById(
      "historyList"
    );

  list.innerHTML = `
    <div class="empty-history-message">
      正在載入歷史資料...
    </div>
  `;

  try {

    const result =
      await api(
        "getHistoryOrders"
      );

    console.log(
      "歷史資料：",
      result
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

    historyOrders =
  result.orders.filter(
    function (order) {

      return isWithinLastThreeMonths(
        order.date
      );

    }
  );

    buildHistoryChannelOptions();

    updateHistoryBranchOptions();

    renderFilteredHistoryOrders();

  } catch (error) {

    console.error(
      "讀取歷史資料失敗：",
      error
    );

    list.innerHTML = `
      <div class="empty-history-message">
        讀取歷史資料失敗：
        ${escapeHistoryHtml(error.message)}
      </div>
    `;
  }
}


/**
 * 建立通路下拉選單
 */
function buildHistoryChannelOptions() {

  const channelSelect =
    document.getElementById(
      "historyChannel"
    );

  const channels =
    Array.from(
      new Set(
        historyOrders
          .map(function (order) {

            return String(
              order.channel || ""
            ).trim();

          })
          .filter(Boolean)
      )
    );

  channelSelect.innerHTML = `
    <option value="">
      全部通路
    </option>
  `;

  channels.forEach(function (channel) {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      channel;

    option.textContent =
      channel;

    channelSelect.appendChild(
      option
    );
  });
}


/**
 * 依目前通路建立店家選單
 */
function updateHistoryBranchOptions() {

  const channelSelect =
    document.getElementById(
      "historyChannel"
    );

  const branchSelect =
    document.getElementById(
      "historyBranch"
    );

  const selectedChannel =
    channelSelect.value;

  const branches =
    Array.from(
      new Set(
        historyOrders
          .filter(function (order) {

            if (!selectedChannel) {
              return true;
            }

            return (
              order.channel ===
              selectedChannel
            );
          })
          .map(function (order) {

            return String(
              order.branch || ""
            ).trim();

          })
          .filter(Boolean)
      )
    );

  branchSelect.innerHTML = `
    <option value="">
      全部店家
    </option>
  `;

  branches.forEach(function (branch) {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      branch;

    option.textContent =
      branch;

    branchSelect.appendChild(
      option
    );
  });
}


/**
 * 篩選並顯示歷史抄貨單
 */
function renderFilteredHistoryOrders() {

  const channel =
    document.getElementById(
      "historyChannel"
    ).value;

  const branch =
    document.getElementById(
      "historyBranch"
    ).value;

  const filteredOrders =
    historyOrders.filter(
      function (order) {

        if (
          channel &&
          order.channel !== channel
        ) {
          return false;
        }

        if (
          branch &&
          order.branch !== branch
        ) {
          return false;
        }

        return true;
      }
    );

  renderHistoryOrders(
    filteredOrders
  );
}


/**
 * 顯示歷史抄貨單
 */
function renderHistoryOrders(orders) {

  const list =
    document.getElementById(
      "historyList"
    );

  if (orders.length === 0) {

    list.innerHTML = `
      <div class="empty-history-message">
        目前沒有符合的歷史資料
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  orders.forEach(function (order) {

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "history-order-row";

    const itemCount =
      Array.isArray(order.items)
        ? order.items.length
        : 0;

    row.innerHTML = `
      <div class="history-order-date">
        ${escapeHistoryHtml(
          formatHistoryDate(order.date)
        )}
      </div>

      <div class="history-order-channel">
        ${escapeHistoryHtml(
          order.channel
        )}
      </div>

      <div class="history-order-branch">
        ${escapeHistoryHtml(
          order.branch
        )}
      </div>

      <div class="history-order-count">
        ${itemCount} 項商品
      </div>

      <a
        class="history-view-button"
        href="history-detail.html?id=${encodeURIComponent(order.id)}">
        查看
      </a>
    `;

    list.appendChild(
      row
    );
  });
}

/**
 * 判斷歷史資料是否在最近 3 個月內
 */
function isWithinLastThreeMonths(value) {

  const parts =
    String(value || "")
      .trim()
      .split(/[\/\-]/);

  if (parts.length !== 3) {
    return false;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const orderDate =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    Number.isNaN(
      orderDate.getTime()
    )
  ) {
    return false;
  }

  const today = new Date();

  today.setHours(
    23,
    59,
    59,
    999
  );

  const threeMonthsAgo =
    new Date(
      today.getFullYear(),
      today.getMonth() - 3,
      today.getDate()
    );

  threeMonthsAgo.setHours(
    0,
    0,
    0,
    0
  );

  return (
    orderDate >= threeMonthsAgo &&
    orderDate <= today
  );
}


/**
 * 日期統一顯示 yyyy-mm-dd
 */
function formatHistoryDate(value) {

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
function escapeHistoryHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
