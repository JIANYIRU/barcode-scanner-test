console.log("api.js v17 已載入");

const API_URL =
  "https://script.google.com/macros/s/AKfycbx72SVhLV6QPcK7bESsP-OH-PXfH-2_uKT_CwE3k6PWrlj1lcJg6N5U1fErujC2EZM9Uw/exec";

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

/**
 * 呼叫 Apps Script POST API
 */
async function apiPost(action, data = {}) {
  const requestBody = {
    action,
    ...data
  };

  console.log(
    "正在呼叫 POST API：",
    requestBody
  );

  const response = await fetch(API_URL, {
    method: "POST",
    redirect: "follow",
    cache: "no-store",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(requestBody)
  });

  const responseText =
    await response.text();

  console.log(
    "POST API 原始回應：",
    responseText
  );

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


