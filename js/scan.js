console.log("scan.js v12 已載入");

document.addEventListener("DOMContentLoaded", init);

let html5QrCode = null;
let isCameraRunning = false;

/**
 * 初始化新增抄貨單頁面
 */
function init() {
  renderOrderInfo();
  bindEvents();
}

/**
 * 顯示通路、店家與日期
 */
function renderOrderInfo() {
  const params = new URLSearchParams(window.location.search);

  const channel = params.get("channel") || "";
  const branch = params.get("branch") || "";
  const date = params.get("date") || "";

  document.getElementById("orderInfo").innerHTML = `
    <span><strong>通路：</strong>${escapeHtml(channel)}</span>
    <span><strong>店家：</strong>${escapeHtml(branch)}</span>
    <span><strong>日期：</strong>${escapeHtml(date)}</span>
  `;
}

/**
 * 綁定按鈕事件
 */
function bindEvents() {
  document
    .getElementById("scanButton")
    .addEventListener("click", openCamera);

  document
    .getElementById("closeCameraButton")
    .addEventListener("click", closeCamera);

  document
    .getElementById("manualButton")
    .addEventListener("click", function () {
      alert("手動輸入條碼功能稍後開發");
    });

  document
    .getElementById("saveButton")
    .addEventListener("click", function () {
      alert("暫存功能開發中");
    });

  document
    .getElementById("completeButton")
    .addEventListener("click", function () {
      alert("完成抄貨功能開發中");
    });
}

/**
 * 開啟後鏡頭
 */
async function openCamera() {
  const cameraArea = document.getElementById("cameraArea");
  const cameraStatus = document.getElementById("cameraStatus");

  if (isCameraRunning) {
    return;
  }

  if (typeof Html5Qrcode === "undefined") {
    cameraStatus.textContent = "條碼掃描元件載入失敗。";
    cameraArea.hidden = false;
    return;
  }

  cameraArea.hidden = false;
  cameraStatus.textContent = "正在開啟相機…";

  try {
    html5QrCode = new Html5Qrcode("reader");

    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: function (viewfinderWidth, viewfinderHeight) {
          return {
            width: Math.floor(viewfinderWidth * 0.85),
            height: Math.min(
              160,
              Math.floor(viewfinderHeight * 0.35)
            )
          };
        },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128
        ]
      },
      handleScanSuccess,
      function () {
        // 掃描途中讀不到條碼是正常狀況，不顯示錯誤。
      }
    );

    isCameraRunning = true;
    cameraStatus.textContent = "請將商品條碼對準掃描框。";
  } catch (error) {
    console.error("相機啟動失敗：", error);

    cameraStatus.textContent =
      "相機啟動失敗，請確認已允許相機權限，並使用手機 Chrome 或 Safari 開啟。";

    html5QrCode = null;
    isCameraRunning = false;
  }
}

/**
 * 關閉相機
 */
async function closeCamera() {
  const cameraArea = document.getElementById("cameraArea");
  const cameraStatus = document.getElementById("cameraStatus");

  try {
    if (html5QrCode && isCameraRunning) {
      await html5QrCode.stop();
      await html5QrCode.clear();
    }
  } catch (error) {
    console.error("關閉相機失敗：", error);
  } finally {
    html5QrCode = null;
    isCameraRunning = false;
    cameraStatus.textContent = "";
    cameraArea.hidden = true;
  }
}

/**
 * 掃描成功
 */
function handleScanSuccess(decodedText) {
  console.log("掃描成功：", decodedText);

  document.getElementById("cameraStatus").textContent =
    `掃描成功：${decodedText}`;
}

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
