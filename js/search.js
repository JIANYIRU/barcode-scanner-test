document.addEventListener(
  "DOMContentLoaded",
  initProductSearch
);


/**
 * 初始化商品搜尋頁
 */
function initProductSearch() {

  const searchButton =
    document.getElementById(
      "searchProductButton"
    );

  const searchInput =
    document.getElementById(
      "searchKeyword"
    );

  searchButton.addEventListener(
    "click",
    searchProductsFromPage
  );

  /*
   * 電腦按 Enter 也能直接搜尋
   */
  searchInput.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {
        searchProductsFromPage();
      }

    }
  );
}


/**
 * 搜尋商品
 */
async function searchProductsFromPage() {

  const input =
    document.getElementById(
      "searchKeyword"
    );

  const keyword =
    String(input.value || "").trim();

  const summary =
    document.getElementById(
      "searchSummary"
    );

  const resultArea =
    document.getElementById(
      "searchResult"
    );

  if (!keyword) {

    alert("請輸入搜尋關鍵字。");

    input.focus();

    return;
  }

  summary.textContent =
    "搜尋中…";

  resultArea.innerHTML = "";

  try {

    const result =
      await api(
        "searchProducts",
        {
          keyword: keyword
        }
      );

    console.log(
      "商品搜尋結果：",
      result
    );

    if (
      !result.success ||
      !Array.isArray(result.products)
    ) {
      throw new Error(
        result.message ||
        "搜尋失敗。"
      );
    }

    renderSearchProducts(
      result.products
    );

  } catch (error) {

    console.error(
      "商品搜尋失敗：",
      error
    );

    summary.textContent =
      "搜尋失敗。";

    resultArea.innerHTML = `
      <p>
        ${escapeSearchHtml(error.message)}
      </p>
    `;
  }
}


/**
 * 顯示商品搜尋結果
 */
function renderSearchProducts(products) {

  const summary =
    document.getElementById(
      "searchSummary"
    );

  const resultArea =
    document.getElementById(
      "searchResult"
    );

  if (products.length === 0) {

    summary.textContent =
      "查無符合商品。";

    resultArea.innerHTML = "";

    return;
  }

  summary.textContent =
    `找到 ${products.length} 項商品`;

  resultArea.innerHTML = "";

  products.forEach(function (product) {

    const row =
      document.createElement("div");

    row.className =
      "search-product-row";

    row.innerHTML = `
      <div class="search-product-info">

        <div class="search-product-barcode">
          ${escapeSearchHtml(product.barcode)}
        </div>

        <div class="search-product-name">
          ${escapeSearchHtml(product.name)}
        </div>

      </div>

      <button
        class="copy-barcode-button"
        type="button"
        data-barcode="${escapeSearchHtml(product.barcode)}">
        複製條碼
      </button>
    `;

    resultArea.appendChild(row);
  });

  bindCopyBarcodeButtons();
}


/**
 * 綁定複製條碼按鈕
 */
function bindCopyBarcodeButtons() {

  document
    .querySelectorAll(
      ".copy-barcode-button"
    )
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          copyBarcode(
            button
          );

        }
      );

    });
}


/**
 * 複製商品條碼
 */
async function copyBarcode(button) {

  const barcode =
    button.dataset.barcode || "";

  if (!barcode) {
    return;
  }

  try {

    await navigator.clipboard.writeText(
      barcode
    );

    button.textContent =
      "已複製 ✓";

    setTimeout(function () {

      button.textContent =
        "複製條碼";

    }, 1200);

  } catch (error) {

    console.error(
      "複製條碼失敗：",
      error
    );

    alert(
      `請手動複製條碼：${barcode}`
    );
  }
}


/**
 * HTML 安全處理
 */
function escapeSearchHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
