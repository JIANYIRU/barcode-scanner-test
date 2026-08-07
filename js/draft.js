document.addEventListener(
  "DOMContentLoaded",
  renderDraftOrders
);

/**
 * ==========================================
 * 進行中的抄貨
 * ==========================================
 */

/**
 * 顯示所有暫存抄貨單
 */
function renderDraftOrders() {
  const draftContent =
    document.getElementById("draftContent");

  const data =
    localStorage.getItem("draftOrders");

  if (!data) {
    showEmptyDraftMessage();
    return;
  }

  try {
    const drafts = JSON.parse(data);

    if (
      !Array.isArray(drafts) ||
      drafts.length === 0
    ) {
      showEmptyDraftMessage();
      return;
    }

    draftContent.innerHTML = "";

    // 最近修改的排前面
    drafts
      .slice()
      .sort(function (a, b) {
        return String(b.updatedAt || "")
          .localeCompare(
            String(a.updatedAt || "")
          );
      })
      .forEach(function (draft) {
        const card =
          createDraftCard(draft);

        draftContent.appendChild(card);
      });

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
 * 建立單張暫存抄貨卡片
 */
function createDraftCard(draft) {
  const card =
    document.createElement("div");

  card.className = "draft-card";

  const channel =
    draft.channel || "";

  const branch =
    draft.branch || "";

  const date =
    draft.date || "";

  const itemCount =
    Array.isArray(draft.items)
      ? draft.items.length
      : 0;

  const draftId =
    draft.id || "";

  const continueUrl =
    `scan.html?channel=${encodeURIComponent(channel)}`
    + `&branch=${encodeURIComponent(branch)}`
    + `&date=${encodeURIComponent(date)}`
    + `&draftId=${encodeURIComponent(draftId)}`;

  card.innerHTML = `
    <div class="draft-main">

      <strong>
        ${escapeHtml(channel)}
      </strong>

      <span>
        ${escapeHtml(branch)}
      </span>

      <span>
        ${itemCount} 項
      </span>

    </div>

    <div class="draft-date">
      ${escapeHtml(date)}
    </div>

    <a
      class="continue-draft-button"
      href="${continueUrl}">
      繼續抄貨
    </a>
  `;

  return card;
}


/**
 * 顯示沒有暫存資料
 */
function showEmptyDraftMessage() {
  const draftContent =
    document.getElementById("draftContent");

  draftContent.innerHTML = `
    <p class="empty-draft-message">
      目前沒有進行中的抄貨。
    </p>
  `;
}


/**
 * 避免文字被當成 HTML 執行
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
