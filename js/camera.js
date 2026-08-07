let html5QrCode = null;
let isCameraRunning = false;
let cameraCapabilities = null;

// 防止同一時間重複查詢 API
let isScanLocked = false;

// 紀錄最近一次掃描
let lastBarcode = "";
let lastScanTime = 0;

/**
 * 開啟後鏡頭
 */
async function openCamera() {
  const cameraArea = document.getElementById("cameraArea");
  const cameraStatus = document.getElementById("cameraStatus");
  const scanActions = document.querySelector(".scan-actions");

  if (isCameraRunning) {
    return;
  }

  cameraArea.hidden = false;
  scanActions.classList.add("camera-open");
  cameraStatus.textContent = "正在開啟相機…";

  try {
    html5QrCode = new Html5Qrcode("reader");

    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 15,

        // 手機相機常見比例
        aspectRatio: 4 / 3,

        // 商品條碼使用寬、扁的掃描框
        qrbox: function (viewfinderWidth, viewfinderHeight) {
          return {
            width: Math.floor(viewfinderWidth * 0.92),
            height: Math.min(
              130,
              Math.floor(viewfinderHeight * 0.28)
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
        // 尚未辨識成功時不顯示錯誤
      }
    );

isCameraRunning = true;

cameraStatus.textContent =
  "請將商品條碼橫向對準掃描框；小條碼請勿靠太近，可使用下方變焦。";

await setupCameraControls();
  } catch (error) {
    console.error("相機啟動失敗：", error);

    cameraStatus.textContent =
      "相機啟動失敗，請確認已允許相機權限。";

    scanActions.classList.remove("camera-open");
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
  const scanActions = document.querySelector(".scan-actions");

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
    scanActions.classList.remove("camera-open");
    document.getElementById("zoomControls").hidden = true;
cameraCapabilities = null;
  }
}

/**
 * 掃描成功後查詢商品
 */
async function handleScanSuccess(decodedText) {
  const barcode = String(decodedText || "").trim();

  if (!barcode) {
    return;
  }

  const now = Date.now();

  // API 正在查詢時，先忽略其他掃描結果
  if (isScanLocked) {
    return;
  }

  // 同一條碼 1.5 秒內重複出現時忽略
  if (
    barcode === lastBarcode &&
    now - lastScanTime < 1500
  ) {
    return;
  }

  isScanLocked = true;
  lastBarcode = barcode;
  lastScanTime = now;

  const cameraStatus =
    document.getElementById("cameraStatus");

  cameraStatus.textContent =
    `正在查詢商品：${barcode}`;

  try {
    const result = await api("findProduct", {
      barcode: barcode
    });

    console.log("商品查詢結果：", result);

    if (!result.success || !result.product) {
      currentProduct = null;

      cameraStatus.textContent =
        result.message || `查無商品：${barcode}`;

      return;
    }

 currentProduct = result.product;

if (navigator.vibrate) {
  navigator.vibrate(100);
}

showProductPreview(currentProduct);

cameraStatus.textContent =
  `已辨識商品：${currentProduct.name}`;

 } catch (error) {

  } finally {
    // 稍微停頓後繼續接受下一個條碼
    setTimeout(function () {
      isScanLocked = false;
    }, 800);
  }
}

/**
 * 設定相機的對焦與變焦功能
 */
async function setupCameraControls() {
  const zoomControls =
    document.getElementById("zoomControls");

  const zoomSlider =
    document.getElementById("zoomSlider");

  const zoomValue =
    document.getElementById("zoomValue");

  try {
    cameraCapabilities =
      html5QrCode.getRunningTrackCapabilities();

    console.log("相機支援能力：", cameraCapabilities);

    // 部分手機支援連續自動對焦
    if (
      Array.isArray(cameraCapabilities.focusMode) &&
      cameraCapabilities.focusMode.includes("continuous")
    ) {
      try {
        await html5QrCode.applyVideoConstraints({
          advanced: [
            {
              focusMode: "continuous"
            }
          ]
        });
      } catch (focusError) {
        console.warn("無法套用連續對焦：", focusError);
      }
    }

    // 手機支援變焦時才顯示滑桿
    if (
      cameraCapabilities.zoom &&
      typeof cameraCapabilities.zoom.min === "number" &&
      typeof cameraCapabilities.zoom.max === "number"
    ) {
      const minZoom = cameraCapabilities.zoom.min;
      const maxZoom = cameraCapabilities.zoom.max;
      const zoomStep = cameraCapabilities.zoom.step || 0.1;

      zoomSlider.min = minZoom;
      zoomSlider.max = maxZoom;
      zoomSlider.step = zoomStep;
      zoomSlider.value = minZoom;

      zoomValue.textContent =
        Number(minZoom).toFixed(1);

      zoomControls.hidden = false;
    } else {
      zoomControls.hidden = true;
    }
  } catch (error) {
    console.warn("無法取得相機變焦能力：", error);
    zoomControls.hidden = true;
  }
}

/**
 * 套用相機變焦
 */
async function changeCameraZoom(event) {
  if (!html5QrCode || !isCameraRunning) {
    return;
  }

  const zoom = Number(event.target.value);

  document.getElementById("zoomValue").textContent =
    zoom.toFixed(1);

  try {
    await html5QrCode.applyVideoConstraints({
      advanced: [
        {
          zoom: zoom
        }
      ]
    });
  } catch (error) {
    console.error("相機變焦失敗：", error);
  }
}


