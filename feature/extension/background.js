const PHASE = "Phase 1";

chrome.runtime.onInstalled.addListener(() => {
  console.info("AI Feed Shield installed: extension foundation is ready.");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "feed-shield:get-status") {
    return;
  }

  sendResponse({
    phase: PHASE,
    status: "ready",
    message: "Extension shell loaded. Content analysis is not enabled yet."
  });
});
