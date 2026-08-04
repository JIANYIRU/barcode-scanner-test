console.log("api.js v17 已載入");

const API_URL =
  "https://script.google.com/macros/s/AKfycbzhYLD2QZVNsKfZTwkvAV74TxG0a6vgfRh9P6CU1oH4L1Qor8PALtOVuIZHrLU7KKySMQ/exec";

/**
 * 呼叫 Apps Script API
 */
async function api(action, params = {}) {
  const query = new URLSearchParams({
    action,
    ...params,
    _timestamp: Date.now()
  });

  const requestUrl = `${API_URL}?${query.toString()}`;

  console.log("正在呼叫 API：", requestUrl);

  const response = await fetch(requestUrl, {
    method: "GET",
    redirect: "follow",
    cache: "no-store"
  });

  const responseText = await response.text();

  console.log("API 原始回應：", responseText);

  if (!response.ok) {
    throw new Error(
      `API 連線失敗：HTTP ${response.status}`
    );
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(
      `API 回傳內容不是 JSON：${responseText.slice(0, 100)}`
    );
  }
}
