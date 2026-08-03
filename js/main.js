console.log("main.js 已載入");
document.addEventListener("DOMContentLoaded", init);

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
    document.getElementById("orderDate");

  const today = new Date();

  const localDate = new Date(
    today.getTime() -
    today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

  dateInput.value = localDate;

}

/**
 * 綁定事件
 */
function bindEvents() {

  const startButton =
    document.getElementById("startButton");

  startButton.addEventListener(
    "click",
    startScan
  );

}

/**
 * 開始抄貨
 */
function startScan() {

  const channel =
    document.getElementById("channel").value;

  const branch =
    document.getElementById("branch").value;

  const orderDate =
    document.getElementById("orderDate").value;

  alert(

`通路：${channel}

店家：${branch}

日期：${orderDate}`

  );

}


/**
 * 載入通路
 */
async function loadChannels() {
  const channelSelect = document.getElementById("channel");

  channelSelect.innerHTML =
    '<option value="">正在載入通路...</option>';

  try {
    const result = await api("getChannels");

    console.log("通路載入結果：", result);

    if (!result.success || !Array.isArray(result.channels)) {
      throw new Error(result.message || "通路資料格式錯誤");
    }

    channelSelect.innerHTML =
      '<option value="">請選擇通路</option>';

    result.channels.forEach(function (channel) {
      const option = document.createElement("option");

      option.value = channel.code;
      option.textContent = channel.name;

      channelSelect.appendChild(option);
    });
  } catch (error) {
    console.error("通路載入失敗：", error);

    channelSelect.innerHTML =
      '<option value="">通路載入失敗</option>';
  }
}
