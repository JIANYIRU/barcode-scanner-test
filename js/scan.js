document.addEventListener("DOMContentLoaded", init);

function init() {

    const params = new URLSearchParams(window.location.search);

    const channel = params.get("channel");

    const branch = params.get("branch");

    const date = params.get("date");

    document.getElementById("orderInfo").innerHTML = `
        <strong>通路：</strong>${channel}<br>
        <strong>店家：</strong>${branch}<br>
        <strong>日期：</strong>${date}
    `;

    document
        .getElementById("scanButton")
        .addEventListener("click", function () {

            alert("下一步開始串相機");

        });

}
