console.log("AI Feed Shield: Twitter/X adapter loaded.");

function extractPostFromTwitter(element) {
  // Extract text
  const textEl = element.querySelector('[data-testid="tweetText"]');
  const text = textEl ? textEl.innerText : '';
  
  // Extract images
  const imgEls = element.querySelectorAll('[data-testid="tweetPhoto"] img, [data-testid="swipeableMediaGallery"] img');
  const images = Array.from(imgEls).map(img => img.src).filter(src => src && !src.includes('emoji'));
  
  return new UniversalPost({
    id: 'twitter-' + Math.random().toString(36).substr(2, 9),
    platform: 'twitter',
    type: 'post',
    text: text,
    images: images,
    element: element
  });
}

function processTwitterElements() {
  const tweets = document.querySelectorAll('article[data-testid="tweet"]');
  tweets.forEach(tweetEl => {
    if (!processedElements.has(tweetEl)) {
      processedElements.add(tweetEl);
      const post = extractPostFromTwitter(tweetEl);
      // Process if it has text OR images!
      if (post.text.trim().length > 0 || post.images.length > 0) {
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
