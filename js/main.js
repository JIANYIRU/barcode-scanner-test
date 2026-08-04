console.log("main.js v9 已載入");

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
  const dateInput = document.getElementById("orderDate");
  const today = new Date();

  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

  dateInput.value = localDate;
}

/**
 * 綁定事件
 */
function bindEvents() {
  const channelSelect =
    document.getElementById("channel");

  const startButton =
    document.getElementById("startButton");

  channelSelect.addEventListener("change", function () {
    loadBranches(channelSelect.value);
  });

  startButton.addEventListener("click", startScan);
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

    channelSelect.innerHTML = "";

    result.channels.forEach(function (channel) {
      const option = document.createElement("option");

      option.value = channel.code;
      option.textContent = channel.name;

      channelSelect.appendChild(option);
    });

    // 預設選擇第一個通路
    if (result.channels.length > 0) {
      const firstChannelCode = result.channels[0].code;

      channelSelect.value = firstChannelCode;

      console.log("準備載入店家，通路代號：", firstChannelCode);

      await loadBranches(firstChannelCode);
    }
  } catch (error) {
    console.error("通路載入失敗：", error);

    channelSelect.innerHTML =
      '<option value="">通路載入失敗</option>';
  }
}

/**
 * 依通路載入店家
 */
async function loadBranches(channelCode) {
  const branchSelect = document.getElementById("branch");

  console.log("loadBranches 收到：", channelCode);

  if (!channelCode) {
    branchSelect.innerHTML =
      '<option value="">請先選擇通路</option>';
    return;
  }

  branchSelect.innerHTML =
    '<option value="">正在載入店家...</option>';

  try {
    const result = await api("getBranches", {
      channelCode: channelCode
    });

    console.log("店家載入結果：", result);

    if (!result.success || !Array.isArray(result.branches)) {
      throw new Error(result.message || "店家資料格式錯誤");
    }

    branchSelect.innerHTML = "";

    if (result.branches.length === 0) {
      branchSelect.innerHTML =
        '<option value="">目前沒有店家</option>';
      return;
    }

    result.branches.forEach(function (branch) {
      const option = document.createElement("option");

      option.value = branch.code;
      option.textContent = branch.name;

      branchSelect.appendChild(option);
    });
  } catch (error) {
    console.error("店家載入失敗：", error);

    branchSelect.innerHTML =
      '<option value="">店家載入失敗</option>';
  }
}
/**
 * 開始抄貨
 */
function startScan() {

  const channelSelect =
    document.getElementById("channel");

  const branchSelect =
    document.getElementById("branch");

  const orderDate =
    document.getElementById("orderDate").value;

  const channelName =
    channelSelect.options[channelSelect.selectedIndex].text;

  const branchName =
    branchSelect.options[branchSelect.selectedIndex].text;

  const url =
    `scan.html?channel=${encodeURIComponent(channelName)}`
    + `&branch=${encodeURIComponent(branchName)}`
    + `&date=${encodeURIComponent(orderDate)}`;

  window.location.href = url;

}
