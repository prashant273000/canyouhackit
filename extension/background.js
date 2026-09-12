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

  // 1. Text Analysis
  if (post.text) {
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
    
    // Semantic mock
    try {
      const res = await fetch(`${BACKEND_URL}/analyze/semantic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, text: post.text })
      });
      const data = await res.json();
      if (!data.is_safe) {
        is_safe = false;
        reasons.push(data.reason);
      }
    } catch (e) {
      console.warn("Semantic analysis failed:", e);
    }
  }

  // 2. Image Analysis
  if (post.images && post.images.length > 0) {
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
