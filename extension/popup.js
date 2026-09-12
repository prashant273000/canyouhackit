document.getElementById('test-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: "PING" }, (response) => {
    document.getElementById('log').innerText = "Response: " + JSON.stringify(response);
  });
});
