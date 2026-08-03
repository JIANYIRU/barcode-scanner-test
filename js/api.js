console.log("api.js 已載入");

// Apps Script API
const API_URL =
  "https://script.google.com/macros/s/AKfycbzhYLD2QZVNsKfZTwkvAV74TxG0a6vgfRh9P6CU1oH4L1Qor8PALtOVuIZHrLU7KKySMQ/exec";

/**
 * 呼叫 API
 */
async function api(action, params = {}) {

  const query = new URLSearchParams({
    action,
    ...params
  });

  const response = await fetch(
    `${API_URL}?${query.toString()}`
  );

  return await response.json();

}
