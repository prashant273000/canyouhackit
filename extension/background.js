const contentScriptStatus = new Map();

chrome.runtime.onInstalled.addListener(() => {
  console.info("AI Feed Shield extension installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "feed-shield:content-ready") {
    const tabId = sender.tab?.id ?? "unknown";
    contentScriptStatus.set(tabId, {
      receivedAt: new Date().toISOString(),
      url: sender.tab?.url ?? "unknown"
    });

    sendResponse({
      ok: true,
      message: "Background service worker received the content script test message."
    });
    return;
  }

  if (message?.type === "feed-shield:popup-ping") {
    sendResponse({
      ok: true,
      message: "Background service worker is responding to the popup."
    });
    return;
  }

  if (message?.type === "feed-shield:get-content-status") {
    const tabId = message.tabId;
    sendResponse({ ok: true, status: contentScriptStatus.get(tabId) ?? null });
  }
});
