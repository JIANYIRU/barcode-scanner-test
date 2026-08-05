const ORDER_ITEMS_STORAGE_KEY = "orderItems";

/**
 * 儲存目前抄貨商品
 */
function saveOrderItems() {
  try {
    localStorage.setItem(
      ORDER_ITEMS_STORAGE_KEY,
      JSON.stringify(orderItems)
    );
  } catch (error) {
    console.error("儲存暫存抄貨單失敗：", error);
  }
}

/**
 * 讀取暫存抄貨商品
 */
function loadOrderItems() {
  const data =
    localStorage.getItem(ORDER_ITEMS_STORAGE_KEY);

  if (!data) {
    return;
  }

  try {
    const parsedData = JSON.parse(data);

    if (!Array.isArray(parsedData)) {
      throw new Error("暫存資料格式錯誤");
    }

    orderItems = parsedData;
    renderProductList();
  } catch (error) {
    console.error("讀取暫存抄貨單失敗：", error);

    localStorage.removeItem(
      ORDER_ITEMS_STORAGE_KEY
    );

    orderItems = [];
  }
}
