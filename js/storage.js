/**
 * ==========================================
 * 多張抄貨單暫存
 * ==========================================
 */

const DRAFT_ORDERS_STORAGE_KEY = "draftOrders";
const OLD_CURRENT_ORDER_STORAGE_KEY = "currentOrder";

/**
 * 產生每張抄貨單的唯一識別碼
 */
function createDraftId() {
  return (
    "draft-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

/**
 * 讀取所有暫存抄貨單
 */
function getDraftOrders() {
  const data =
    localStorage.getItem(
      DRAFT_ORDERS_STORAGE_KEY
    );

  if (!data) {
    return [];
  }

  try {
    const drafts = JSON.parse(data);

    if (!Array.isArray(drafts)) {
      throw new Error("暫存清單格式錯誤");
    }

    return drafts;
  } catch (error) {
    console.error(
      "讀取多張暫存抄貨單失敗：",
      error
    );

    localStorage.removeItem(
      DRAFT_ORDERS_STORAGE_KEY
    );

    return [];
  }
}

/**
 * 儲存所有暫存抄貨單
 */
function saveDraftOrders(drafts) {
  try {
    localStorage.setItem(
      DRAFT_ORDERS_STORAGE_KEY,
      JSON.stringify(drafts)
    );

    return true;
  } catch (error) {
    console.error(
      "儲存多張暫存抄貨單失敗：",
      error
    );

    return false;
  }
}

/**
 * 儲存目前正在編輯的抄貨單
 *
 * @param {string} draftId 既有暫存單 ID；
 *                         新單可傳空字串
 * @return {Object} 儲存結果
 */
function saveCurrentOrder(draftId = "") {
  const params =
    new URLSearchParams(
      window.location.search
    );

 const id =
  draftId || createDraftId();

  const currentOrder = {
    id: id,

    channel:
      params.get("channel") || "",

    branch:
      params.get("branch") || "",

    date:
      params.get("date") || "",

    items:
      orderItems,

    updatedAt:
      new Date().toISOString()
  };

  const drafts = getDraftOrders();

  const existingIndex =
    drafts.findIndex(function (draft) {
      return draft.id === id;
    });

  if (existingIndex >= 0) {
    // 更新原本那一張，不建立重複資料
    drafts[existingIndex] = currentOrder;
  } else {
    // 新增一張新的暫存抄貨單
    drafts.push(currentOrder);
  }

  const success =
    saveDraftOrders(drafts);

  if (!success) {
    return {
      success: false,
      message: "暫存失敗。"
    };
  }

  return {
    success: true,
    draftId: id,
    order: currentOrder
  };
}

/**
 * 依 draftId 讀取指定的暫存抄貨單
 */
function loadCurrentOrder(draftId) {
  if (!draftId) {
    return null;
  }

  const drafts = getDraftOrders();

  const currentOrder =
    drafts.find(function (draft) {
      return draft.id === draftId;
    });

  if (!currentOrder) {
    return null;
  }

  if (!Array.isArray(currentOrder.items)) {
    console.error(
      "暫存抄貨單商品格式錯誤"
    );

    return null;
  }

  orderItems = currentOrder.items;

  renderProductList();

  return currentOrder;
}

/**
 * 刪除指定的暫存抄貨單
 */
function clearCurrentOrder(draftId) {
  if (!draftId) {
    return;
  }

  const drafts =
    getDraftOrders().filter(
      function (draft) {
        return draft.id !== draftId;
      }
    );

  saveDraftOrders(drafts);
}

/**
 * 將舊版單張 currentOrder 搬到多張暫存格式
 *
 * 只會執行一次，避免舊資料消失。
 */
function migrateOldCurrentOrder() {
  const oldData =
    localStorage.getItem(
      OLD_CURRENT_ORDER_STORAGE_KEY
    );

  if (!oldData) {
    return;
  }

  try {
    const oldOrder =
      JSON.parse(oldData);

    if (
      !oldOrder ||
      !Array.isArray(oldOrder.items)
    ) {
      throw new Error(
        "舊版暫存格式錯誤"
      );
    }

    const drafts = getDraftOrders();

    drafts.push({
      id: createDraftId(),
      channel: oldOrder.channel || "",
      branch: oldOrder.branch || "",
      date: oldOrder.date || "",
      items: oldOrder.items,
      updatedAt:
        new Date().toISOString()
    });

    saveDraftOrders(drafts);

    localStorage.removeItem(
      OLD_CURRENT_ORDER_STORAGE_KEY
    );
  } catch (error) {
    console.error(
      "轉換舊版暫存抄貨單失敗：",
      error
    );
  }
}
