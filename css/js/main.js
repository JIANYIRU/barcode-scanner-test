document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById("orderDate");
  const startButton = document.getElementById("startButton");

  // 預設今天
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

  dateInput.value = localDate;

  startButton.addEventListener("click", function () {
    const channel =
      document.getElementById("channel").value;

    const branch =
      document.getElementById("branch").value;

    const orderDate = dateInput.value;

    alert(
      `通路：${channel}\n` +
      `分支店家：${branch}\n` +
      `日期：${orderDate}`
    );
  });
});
