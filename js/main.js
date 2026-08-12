console.log("main.js v10 已載入");

document.addEventListener("DOMContentLoaded", init);


/**
 * ==========================================
 * localStorage 快取設定
 * ==========================================
 */

const CHANNEL_CACHE_KEY =
  "SMART_STOCK_CHANNELS_V1";

const BRANCH_CACHE_PREFIX =
  "SMART_STOCK_BRANCHES_V1_";

const CACHE_EXPIRE_MS =
  24 * 60 * 60 * 1000;


/**
 * 系統初始化
 */
async function init() {

  setToday();

  bindEvents();

  await loadChannels();

}


/**
 * 設定今天日期
 */
function setToday() {

  const dateInput =
    document.getElementById(
      "orderDate"
    );

  const today =
    new Date();

  const localDate =
    new Date(
      today.getTime() -
      today.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 10);

  dateInput.value =
    localDate;
}


/**
 * 綁定事件
 */
function bindEvents() {

  const channelSelect =
    document.getElementById(
      "channel"
    );

  const startButton =
    document.getElementById(
      "startButton"
    );

  channelSelect.addEventListener(
    "change",
    function () {

      loadBranches(
        channelSelect.value
      );

    }
  );

  startButton.addEventListener(
    "click",
    startScan
  );
}


/**
 * ==========================================
 * localStorage 工具
 * ==========================================
 */


/**
 * 寫入快取
 */
function setLocalCache(
  key,
  data
) {

  try {

    const payload = {
      savedAt: Date.now(),
      data: data
    };

    localStorage.setItem(
      key,
      JSON.stringify(payload)
    );

  } catch (error) {

    console.warn(
      "localStorage 寫入失敗：",
      key,
      error
    );

  }
}


/**
 * 讀取快取
 */
function getLocalCache(key) {

  try {

    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const payload =
      JSON.parse(raw);

    if (
      !payload ||
      !Array.isArray(payload.data)
    ) {
      return null;
    }

    const age =
      Date.now() -
      Number(payload.savedAt || 0);

    if (
      age >
      CACHE_EXPIRE_MS
    ) {

      localStorage.removeItem(
        key
      );

      return null;

    }

    return payload.data;

  } catch (error) {

    console.warn(
      "localStorage 讀取失敗：",
      key,
      error
    );

    return null;

  }
}


/**
 * ==========================================
 * 通路
 * ==========================================
 */


/**
 * 載入通路
 */
async function loadChannels() {

  const channelSelect =
    document.getElementById(
      "channel"
    );

  /*
   * 先看 localStorage
   */
  const cachedChannels =
    getLocalCache(
      CHANNEL_CACHE_KEY
    );

  if (
    Array.isArray(cachedChannels) &&
    cachedChannels.length > 0
  ) {

    console.log(
      "使用本機通路快取：",
      cachedChannels
    );

    renderChannels(
      cachedChannels
    );

    return;
  }


  /*
   * 本機沒有資料才呼叫 API
   */
  channelSelect.innerHTML =
    '<option value="">正在載入通路...</option>';


  try {

    const result =
      await api(
        "getChannels"
      );

    console.log(
      "通路載入結果：",
      result
    );

    if (
      !result.success ||
      !Array.isArray(
        result.channels
      )
    ) {

      throw new Error(
        result.message ||
        "通路資料格式錯誤"
      );

    }

    /*
     * 存進 localStorage
     */
    setLocalCache(
      CHANNEL_CACHE_KEY,
      result.channels
    );

    renderChannels(
      result.channels
    );

  } catch (error) {

    console.error(
      "通路載入失敗：",
      error
    );

    channelSelect.innerHTML =
      '<option value="">通路載入失敗</option>';

  }
}


/**
 * 顯示通路
 */
async function renderChannels(
  channels
) {

  const channelSelect =
    document.getElementById(
      "channel"
    );

  channelSelect.innerHTML = "";

  channels.forEach(
    function (channel) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        channel.code;

      option.textContent =
        channel.name;

      channelSelect.appendChild(
        option
      );

    }
  );


  /*
   * 預設第一個通路
   */
  if (channels.length > 0) {

    const firstChannelCode =
      channels[0].code;

    channelSelect.value =
      firstChannelCode;

    console.log(
      "準備載入店家，通路代號：",
      firstChannelCode
    );

    await loadBranches(
      firstChannelCode
    );

  }
}


/**
 * ==========================================
 * 店家
 * ==========================================
 */


/**
 * 依通路載入店家
 */
async function loadBranches(
  channelCode
) {

  const branchSelect =
    document.getElementById(
      "branch"
    );

  console.log(
    "loadBranches 收到：",
    channelCode
  );


  if (!channelCode) {

    branchSelect.innerHTML =
      '<option value="">請先選擇通路</option>';

    return;

  }


  const branchCacheKey =
    BRANCH_CACHE_PREFIX +
    channelCode;


  /*
   * 先看 localStorage
   */
  const cachedBranches =
    getLocalCache(
      branchCacheKey
    );


  if (
    Array.isArray(cachedBranches)
  ) {

    console.log(
      `使用本機店家快取：${channelCode}`,
      cachedBranches
    );

    renderBranches(
      cachedBranches
    );

    return;

  }


  /*
   * 沒有本機快取才呼叫 API
   */
  branchSelect.innerHTML =
    '<option value="">正在載入店家...</option>';


  try {

    const result =
      await api(
        "getBranches",
        {
          channelCode:
            channelCode
        }
      );


    console.log(
      "店家載入結果：",
      result
    );


    if (
      !result.success ||
      !Array.isArray(
        result.branches
      )
    ) {

      throw new Error(
        result.message ||
        "店家資料格式錯誤"
      );

    }


    /*
     * 存進 localStorage
     */
    setLocalCache(
      branchCacheKey,
      result.branches
    );


    renderBranches(
      result.branches
    );


  } catch (error) {

    console.error(
      "店家載入失敗：",
      error
    );


    branchSelect.innerHTML =
      '<option value="">店家載入失敗</option>';

  }
}


/**
 * 顯示店家
 */
function renderBranches(
  branches
) {

  const branchSelect =
    document.getElementById(
      "branch"
    );

  branchSelect.innerHTML = "";


  if (branches.length === 0) {

    branchSelect.innerHTML =
      '<option value="">目前沒有店家</option>';

    return;

  }


  branches.forEach(
    function (branch) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        branch.code;

      option.textContent =
        branch.name;

      branchSelect.appendChild(
        option
      );

    }
  );
}


/**
 * ==========================================
 * 開始抄貨
 * ==========================================
 */

function startScan() {

  const channelSelect =
    document.getElementById(
      "channel"
    );

  const branchSelect =
    document.getElementById(
      "branch"
    );

  const orderDate =
    document.getElementById(
      "orderDate"
    ).value;


  const channelName =
    channelSelect
      .options[
        channelSelect.selectedIndex
      ]
      .text;


  const branchName =
    branchSelect
      .options[
        branchSelect.selectedIndex
      ]
      .text;


  const url =
    `scan.html?channel=${encodeURIComponent(channelName)}`
    +
    `&branch=${encodeURIComponent(branchName)}`
    +
    `&date=${encodeURIComponent(orderDate)}`;


  window.location.href =
    url;

}
