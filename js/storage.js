/**
 * ==========================================
 * 抄貨單暫存
 * ==========================================
 */

const CURRENT_ORDER_STORAGE_KEY = "currentOrder";

/**
 * 儲存完整抄貨單
 */
function saveCurrentOrder() {
  const params = new URLSearchParams(
    window.location.search
  );

  const currentOrder = {
    channel:
      params.get("channel") || "",

    branch:
      params.get("branch") || "",

    date:
      params.get("date") || "",

    items:
      orderItems
  };

  try {
    localStorage.setItem(
      CURRENT_ORDER_STORAGE_KEY,
      JSON.stringify(currentOrder)
    );

    return {
      success: true,
      order: currentOrder
    };
  } catch (error) {
    console.error(
      "儲存完整抄貨單失敗：",
      error
    );

    return {
      success: false,
      message: "暫存失敗。"
    };
  }
}

/**
 * 讀取完整抄貨單
 */
function loadCurrentOrder() {
  const data =
    localStorage.getItem(
      CURRENT_ORDER_STORAGE_KEY
    );

  if (!data) {
    return null;
  }

  try {
    const currentOrder =
      JSON.parse(data);

    if (
      !currentOrder ||
      !Array.isArray(currentOrder.items)
    ) {
      throw new Error(
        "暫存資料格式錯誤"
      );
    }

    orderItems =
      currentOrder.items;

    renderProductList();

    return currentOrder;
  } catch (error) {
    console.error(
      "讀取完整抄貨單失敗：",
      error
    );

    localStorage.removeItem(
      CURRENT_ORDER_STORAGE_KEY
    );

    orderItems = [];

    return null;
  }
}

/**
 * 清除完整抄貨單
 */
function clearCurrentOrder() {
  localStorage.removeItem(
    CURRENT_ORDER_STORAGE_KEY
  );
}
