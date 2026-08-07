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

    bindDraftDeleteEvents();

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

    <div class="draft-actions">

  <a
    class="continue-draft-button"
    href="${continueUrl}">
    繼續抄貨
  </a>

  <button
    class="delete-draft-button"
    type="button"
    data-draft-id="${escapeHtml(draftId)}">
    刪除
  </button>

</div>
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


/**
 * 刪除指定的暫存抄貨單
 */
function deleteDraftOrder(draftId) {
  const data =
    localStorage.getItem("draftOrders");

  if (!data) {
    return;
  }

  try {
    const drafts = JSON.parse(data);

    if (!Array.isArray(drafts)) {
      return;
    }

    const draft =
      drafts.find(function (item) {
        return item.id === draftId;
      });

    if (!draft) {
      return;
    }

    const confirmed =
      window.confirm(
        `確定要刪除「${draft.channel}｜${draft.branch}」的暫存抄貨單嗎？`
      );

    if (!confirmed) {
      return;
    }

    const newDrafts =
      drafts.filter(function (item) {
        return item.id !== draftId;
      });

    localStorage.setItem(
      "draftOrders",
      JSON.stringify(newDrafts)
    );

    // 刪除後重新顯示列表
    renderDraftOrders();

  } catch (error) {
    console.error(
      "刪除暫存抄貨單失敗：",
      error
    );

    alert("刪除失敗。");
  }
}


/**
 * 綁定暫存單刪除按鈕
 */
function bindDraftDeleteEvents() {
  document
    .querySelectorAll(".delete-draft-button")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const draftId =
            button.dataset.draftId;

          deleteDraftOrder(draftId);

        }
      );

    });
}
