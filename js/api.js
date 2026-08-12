console.log("api.js v19 已載入");

const API_URL =
  "https://script.google.com/macros/s/AKfycbxJnlep7SjJS3HlnYUpv11KwNVWIZCjBpng1PXn0HNz549XoiypUGFyhnMSzDpLrnMl_Q/exec";


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
  timeoutMs = 15000
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
 * ==========================================
 * GET API
 * ==========================================
 *
 * 適用：
 * 通路
 * 店家
 * 商品查詢
 * 商品搜尋
 * 抄貨打單讀取
 * 歷史資料
 *
 * GET 不會修改資料，
 * 因此失敗時可以安全自動重試。
 */
async function api(
  action,
  params = {}
) {

  const maxAttempts = 3;

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
      `GET API ${action}：第 ${attempt}/${maxAttempts} 次嘗試`
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
        `GET API ${action} 第 ${attempt} 次完成：${elapsed}ms`
      );


      if (!response.ok) {

        throw new Error(
          `API 連線失敗：HTTP ${response.status}`
        );

      }


      try {

        const result =
          JSON.parse(responseText);

        console.log(
          `GET API ${action} 成功`
        );

        return result;

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


      if (attempt < maxAttempts) {

        /*
         * 第一次失敗 → 等 1 秒
         * 第二次失敗 → 等 2 秒
         */
        const waitMs =
          attempt * 1000;


        console.log(
          `GET API ${action} ${waitMs / 1000} 秒後自動重試`
        );


        await sleep(waitMs);

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
 * ==========================================
 * POST API
 * ==========================================
 *
 * POST 會修改 Google Sheets。
 *
 * 不自動重送，避免：
 * 第一次其實已成功，
 * 但瀏覽器沒有收到回應，
 * 第二次又重複執行。
 */
async function apiPost(
  action,
  data = {}
) {

  const requestBody = {
    action,
    ...data
  };


  const startTime =
    performance.now();


  console.log(
    `POST API ${action} 開始`,
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

        /*
         * 建檔、完成抄貨可能比較久，
         * POST 給 30 秒。
         */
        30000
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

    console.error(
      `POST API ${action} 失敗：`,
      error
    );


    if (
      error &&
      error.name === "AbortError"
    ) {

      throw new Error(
        "API 等待時間過長。請先確認資料是否已完成，再決定是否重新操作。"
      );

    }


    throw new Error(
      error?.message ||
      "API 連線失敗。"
    );

  }

}
