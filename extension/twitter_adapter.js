console.log("AI Feed Shield: Twitter/X adapter loaded.");

function extractPostFromTwitter(element) {
  // Twitter uses data-testid="tweetText" for the main text body
  const textEl = element.querySelector('[data-testid="tweetText"]');
  const text = textEl ? textEl.innerText : '';
  
  return new UniversalPost({
    id: 'twitter-' + Math.random().toString(36).substr(2, 9),
    platform: 'twitter',
    type: 'post',
    text: text,
    element: element
  });
}

function processTwitterElements() {
  // Find all unhandled tweet articles
  const tweets = document.querySelectorAll('article[data-testid="tweet"]');
  tweets.forEach(tweetEl => {
    // Only process if we haven't seen it and it's not a loading skeleton
    if (!processedElements.has(tweetEl)) {
      processedElements.add(tweetEl);
      const post = extractPostFromTwitter(tweetEl);
      if (post.text.trim().length > 0) {
        markPending(post);
        sendForAnalysis(post);
      }
    }
  });
}

if (window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com')) {
  processTwitterElements();
  const twitterObserver = new MutationObserver(processTwitterElements);
  twitterObserver.observe(document.body, { childList: true, subtree: true });
}
