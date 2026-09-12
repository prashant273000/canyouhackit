const testButton = document.querySelector("#test-button");
const testResult = document.querySelector("#test-result");

testButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "feed-shield:popup-ping" }, (response) => {
    if (chrome.runtime.lastError) {
      testResult.textContent = "Background connection failed.";
      return;
    }

    testResult.textContent = response.message;
  });
});
