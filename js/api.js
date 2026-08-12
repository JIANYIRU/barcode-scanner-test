console.log("api.js v18 已載入");

const API_URL =
  "https://script.google.com/macros/s/AKfycbzUWxi6QcS0kRSOf6zz9GAmsx7GlanfIQkHCuJrseSRzD9qz9qZ4ZxYXUHjXhlm-2Ybdg/exec";


/**
 * 等待指定毫秒
 */
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}


/**
 * 帶逾時控制的 fetch
 */
async function fetchWithTimeout(
  url,
  options = {},
  timeoutMs = 10000
) {

  const controller =
    new AbortController();

  const timer =
    setTimeout(function () {
      controller.abort();
    }, timeoutMs);

  try {

    return await fetch(
      url,
      {
        ...options,
        signal: controller.signal
      }
    );

  } finally {

    clearTimeout(timer);

  }
}


/**
 * 呼叫 Apps Script GET API
 *
 * 第一次失敗時會自動等待後重試一次。
 */
async function api(
  action,
  params = {}
) {

  const maxAttempts = 2;

  let lastError = null;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {

    const query =
      new URLSearchParams({
        action,
        ...params,
        _timestamp: Date.now()
      });

    const requestUrl =
      `${API_URL}?${query.toString()}`;

    const startTime =
      performance.now();

    console.log(
      `GET API ${action}：第 ${attempt} 次嘗試`,
      requestUrl
    );

    try {

      const response =
        await fetchWithTimeout(
          requestUrl,
          {
            method: "GET",
            redirect: "follow",
            cache: "no-store"
          },
          10000
        );

      const responseText =
        await response.text();

      const elapsed =
        Math.round(
          performance.now() -
          startTime
        );

      console.log(
        `GET API ${action} 完成：${elapsed}ms`
      );

      console.log(
        "API 原始回應：",
        responseText
      );

      if (!response.ok) {

        throw new Error(
          `API 連線失敗：HTTP ${response.status}`
        );

      }

      try {

        return JSON.parse(
          responseText
        );

      } catch (error) {

        throw new Error(
          `API 回傳內容不是 JSON：${
            responseText.slice(0, 100)
          }`
        );

      }

    } catch (error) {

      lastError = error;

      console.error(
        `GET API ${action} 第 ${attempt} 次失敗：`,
        error
      );

      /*
       * 還有下一次機會時，
       * 先等待 1 秒再重試。
       */
      if (attempt < maxAttempts) {

        console.log(
          `GET API ${action} 1 秒後自動重試`
        );

        await sleep(1000);

      }

    }

  }

  throw new Error(
    lastError &&
    lastError.name === "AbortError"
      ? "API 連線逾時，請稍後再試。"
      : (
          lastError?.message ||
          "API 連線失敗。"
        )
  );
}


/**
 * 呼叫 Apps Script POST API
 *
 * 第一次失敗時會自動等待後重試一次。
 */
async function apiPost(
  action,
  data = {}
) {

  const maxAttempts = 2;

  let lastError = null;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {

    const requestBody = {
      action,
      ...data
    };

    const startTime =
      performance.now();

    console.log(
      `POST API ${action}：第 ${attempt} 次嘗試`,
      requestBody
    );

    try {

      const response =
        await fetchWithTimeout(
          API_URL,
          {
            method: "POST",
            redirect: "follow",
            cache: "no-store",
            headers: {
              "Content-Type":
                "text/plain;charset=utf-8"
            },
            body:
              JSON.stringify(
                requestBody
              )
          },
          15000
        );

      const responseText =
        await response.text();

      const elapsed =
        Math.round(
          performance.now() -
          startTime
        );

      console.log(
        `POST API ${action} 完成：${elapsed}ms`
      );

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

        return JSON.parse(
          responseText
        );

      } catch (error) {

        throw new Error(
          `API 回傳內容不是 JSON：${
            responseText.slice(0, 100)
          }`
        );

      }

    } catch (error) {

      lastError = error;

      console.error(
        `POST API ${action} 第 ${attempt} 次失敗：`,
        error
      );

      if (attempt < maxAttempts) {

        console.log(
          `POST API ${action} 1 秒後自動重試`
        );

        await sleep(1000);

      }

    }

  }

  throw new Error(
    lastError &&
    lastError.name === "AbortError"
      ? "API 連線逾時，請稍後再試。"
      : (
          lastError?.message ||
          "API 連線失敗。"
        )
  );
}
