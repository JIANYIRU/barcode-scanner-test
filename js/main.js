console.log("main.js v11 已載入");

document.addEventListener(
  "DOMContentLoaded",
  init
);


/**
 * ==========================================
 * 通路／店家固定資料
 * ==========================================
 */

const CHANNEL_DATA = [

  {
    code: "XD",
    name: "小點",
    branches: [
      { code: "XD001", name: "家新" },
      { code: "XD002", name: "利佳" },
      { code: "XD003", name: "京富" },
      { code: "XD004", name: "鉦鑫" },
      { code: "XD005", name: "安東" },
      { code: "XD006", name: "安和" },
      { code: "XD007", name: "吉利" }
    ]
  },

  {
    code: "NH",
    name: "農會",
    branches: [
      { code: "NH001", name: "太平" },
      { code: "NH002", name: "卑南" },
      { code: "NH003", name: "縣農" },
      { code: "NH004", name: "中正" },
      { code: "NH005", name: "新園" },
      { code: "NH006", name: "中華" },
      { code: "NH007", name: "豐里" },
      { code: "NH008", name: "知本" },
      { code: "NH009", name: "初鹿" }
    ]
  },

  {
    code: "ZY",
    name: "正一",
    branches: [
      { code: "ZY001", name: "中華店" },
      { code: "ZY002", name: "卑南店" },
      { code: "ZY003", name: "園藝店" },
      { code: "ZY004", name: "更生店" },
      { code: "ZY005", name: "豐榮店" },
      { code: "ZY006", name: "新生店" }
    ]
  },

  {
    code: "LI",
    name: "鹿野",
    branches: [
      { code: "LI001", name: "金昇利" },
      { code: "LI002", name: "瑞源" },
      { code: "LI003", name: "延平" }
    ]
  },

  {
    code: "GS",
    name: "關山",
    branches: [
      { code: "GS001", name: "政利" },
      { code: "GS002", name: "關農" },
      { code: "GS003", name: "正一關山" }
    ]
  },

  {
    code: "CS",
    name: "池上",
    branches: [
      { code: "CS001", name: "池農" },
      { code: "CS002", name: "正一池上" },
      { code: "CS003", name: "正一玉里" }
    ]
  },

  {
    code: "CG",
    name: "成功",
    branches: [
      { code: "CG001", name: "成農" },
      { code: "CG002", name: "正一成功" },
      { code: "CG003", name: "漁會" },
      { code: "CG004", name: "豐展" }
    ]
  },

  {
    code: "ON",
    name: "169",
    branches: [
      { code: "ON001", name: "169" }
    ]
  }

];


/**
 * 系統初始化
 */
function init() {

  setToday();

  bindEvents();

  loadChannels();

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
 * 載入通路
 * ==========================================
 */

function loadChannels() {

  const channelSelect =
    document.getElementById(
      "channel"
    );

  channelSelect.innerHTML = "";


  CHANNEL_DATA.forEach(
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
  if (CHANNEL_DATA.length > 0) {

    const firstChannelCode =
      CHANNEL_DATA[0].code;

    channelSelect.value =
      firstChannelCode;

    loadBranches(
      firstChannelCode
    );

  }

}


/**
 * ==========================================
 * 依通路載入店家
 * ==========================================
 */

function loadBranches(
  channelCode
) {

  const branchSelect =
    document.getElementById(
      "branch"
    );

  branchSelect.innerHTML = "";


  const channel =
    CHANNEL_DATA.find(
      function (item) {

        return (
          item.code ===
          channelCode
        );

      }
    );


  if (!channel) {

    branchSelect.innerHTML =
      '<option value="">找不到店家</option>';

    return;

  }


  if (
    !Array.isArray(
      channel.branches
    ) ||
    channel.branches.length === 0
  ) {

    branchSelect.innerHTML =
      '<option value="">目前沒有店家</option>';

    return;

  }


  channel.branches.forEach(
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


  if (
    channelSelect.selectedIndex < 0 ||
    branchSelect.selectedIndex < 0
  ) {

    alert(
      "請選擇通路與店家。"
    );

    return;

  }


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
