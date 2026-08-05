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

/**
 * 取得合法的正整數數量
 */
function getValidQuantity(value) {
  const quantity =
    Number.parseInt(value, 10);

  if (!Number.isInteger(quantity) || quantity < 1) {
    return 1;
  }

  return quantity;
}
