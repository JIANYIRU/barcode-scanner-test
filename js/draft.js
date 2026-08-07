document.addEventListener(
  "DOMContentLoaded",
  renderCurrentDraft
);

/**
 * 顯示目前暫存的抄貨單
 */
function renderCurrentDraft() {
  const draftContent =
    document.getElementById("draftContent");

  const data =
    localStorage.getItem("currentOrder");

  if (!data) {
    draftContent.innerHTML = `
      <p class="empty-draft-message">
        目前沒有進行中的抄貨。
      </p>
    `;

    return;
  }

  try {
    const currentOrder =
      JSON.parse(data);

    if (
      !currentOrder ||
      !Array.isArray(currentOrder.items)
    ) {
      throw new Error("暫存資料格式錯誤");
    }

    const channel =
      currentOrder.channel || "";

    const branch =
      currentOrder.branch || "";

    const date =
      currentOrder.date || "";

    const itemCount =
      currentOrder.items.length;

    const continueUrl =
      `scan.html?channel=${encodeURIComponent(channel)}`
      + `&branch=${encodeURIComponent(branch)}`
      + `&date=${encodeURIComponent(date)}`;

    draftContent.innerHTML = `
      <div class="draft-card">
        <div class="draft-main">
          <strong>${escapeHtml(channel)}</strong>
          <span>${escapeHtml(branch)}</span>
          <span>${itemCount} 項</span>
        </div>

        <div class="draft-date">
          ${escapeHtml(date)}
        </div>

        <a
          class="continue-draft-button"
          href="${continueUrl}">
          繼續抄貨
        </a>
      </div>
    `;
  } catch (error) {
    console.error(
      "讀取進行中抄貨失敗：",
      error
    );

    draftContent.innerHTML = `
      <p class="empty-draft-message">
        暫存資料讀取失敗。
      </p>
    `;
  }
}

/**
 * 避免 HTML 被當成程式執行
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
