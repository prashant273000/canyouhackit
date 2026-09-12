const status = document.querySelector("#status");

chrome.runtime.sendMessage({ type: "feed-shield:get-status" }, (response) => {
  if (chrome.runtime.lastError || !response) {
    status.textContent = "The extension service worker is unavailable.";
    return;
  }

  status.textContent = response.message;
});
