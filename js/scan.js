document.addEventListener("DOMContentLoaded", init);

/**
 * 初始化新增抄貨單頁面
 */
function init() {
  renderOrderInfo();
  bindEvents();
}

/**
 * 顯示通路、店家與日期
 */
function renderOrderInfo() {
  const params = new URLSearchParams(window.location.search);

  const channel = params.get("channel") || "";
  const branch = params.get("branch") || "";
  const date = params.get("date") || "";

  const orderInfo = document.getElementById("orderInfo");

  orderInfo.innerHTML = `
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
    .getElementById("scanButton")
    .addEventListener("click", function () {
      alert("相機功能將於 Sprint 5 開發");
    });

  document
    .getElementById("manualButton")
    .addEventListener("click", function () {
      alert("手動輸入條碼功能將於 Sprint 5 開發");
    });

  document
    .getElementById("saveButton")
    .addEventListener("click", function () {
      alert("暫存功能開發中");
    });

  document
    .getElementById("completeButton")
    .addEventListener("click", function () {
      alert("完成抄貨功能開發中");
    });
}

/**
 * 避免網址參數被當成 HTML 執行
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
