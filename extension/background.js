console.log("AI Feed Shield: Background service worker started.");

const BACKEND_URL = "http://localhost:8000";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "PING") {
    sendResponse({ status: "PONG", message: "Hello from background!" });
  } else if (request.type === "ANALYZE_POST") {
    // Process async
    handleAnalyzePost(request.post).then(sendResponse).catch(err => {
      console.error("Analysis error:", err);
      sendResponse({ id: request.post.id, is_safe: true, error: true }); // fail-safe
    });
    return true; // keep channel open
  }
});

async function handleAnalyzePost(post) {
  let is_safe = true;
  let reasons = [];
  
  const settings = await chrome.storage.local.get({
    shield_master: true,
    shield_text: true,
    shield_image: true
  });
  
  if (!settings.shield_master) {
    return { id: post.id, is_safe: true, reason: null };
  }

  // 1. Text Analysis
  if (post.text && settings.shield_text) {
    try {
      const res = await fetch(`${BACKEND_URL}/analyze/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, text: post.text, parentText: post.parentText })
      });
      const data = await res.json();
      if (!data.is_safe) {
        is_safe = false;
        reasons.push(data.reason);
      }
    } catch (e) {
      console.warn("Text analysis failed:", e);
    }
  }

  // 2. Image Analysis
  if (post.images && post.images.length > 0 && settings.shield_image) {
    try {
      const res = await fetch(`${BACKEND_URL}/analyze/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, url: post.images[0] })
      });
      const data = await res.json();
      if (!data.is_safe) {
        is_safe = false;
        reasons.push(data.reason);
      }
    } catch (e) {
      console.warn("Image analysis failed:", e);
    }
  }

  return {
    id: post.id,
    is_safe,
    reason: reasons.join(", ")
  };
}