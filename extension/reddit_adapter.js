console.log("AI Feed Shield: Reddit adapter loaded.");

function extractPostFromReddit(element) {
  const text = element.innerText;
  return new UniversalPost({
    id: 'reddit-' + Math.random(),
    platform: 'reddit',
    type: 'post',
    text: text,
    element: element
  });
}

function processRedditElements() {
  const posts = document.querySelectorAll('shreddit-post, .Post');
  posts.forEach(postEl => {
    if (!processedElements.has(postEl)) {
      processedElements.add(postEl);
      const post = extractPostFromReddit(postEl);
      markPending(post);
      sendForAnalysis(post);
    }
  });
}

if (window.location.hostname.includes('reddit.com')) {
  processRedditElements();
  const redditObserver = new MutationObserver(processRedditElements);
  redditObserver.observe(document.body, { childList: true, subtree: true });
}
