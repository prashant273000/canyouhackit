const statusElement = document.createElement("div");
const parser = new UniversalContentParser([new DemoFeedAdapter()]);
let discoveredPostCount = 0;

statusElement.className = "feed-shield-dev-status";
statusElement.textContent = "AI Feed Shield: connecting to background…";
document.body.append(statusElement);

parser.start(document, (post) => {
  discoveredPostCount += 1;
  console.info("AI Feed Shield discovered a normalized post.", post);
});

chrome.runtime.sendMessage({ type: "feed-shield:content-ready" }, (response) => {
  if (chrome.runtime.lastError) {
    statusElement.textContent = "AI Feed Shield: background connection failed.";
    return;
  }

  statusElement.textContent = `${response.message} Posts discovered: ${discoveredPostCount}.`;
});
