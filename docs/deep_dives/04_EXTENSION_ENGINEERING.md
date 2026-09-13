# Deep Dive: Cross-Browser Extension & API Pipeline

The AI Feed Shield Extension is a Manifest V3 browser extension designed to intercept and mutate the Document Object Model (DOM) of Single Page Applications (SPAs) like Twitter/X in real-time.

## The Twitter DOM Interception (`twitter_adapter.js`)
Modern social media sites do not load statically; they inject HTML elements continuously as the user scrolls (Infinite Scrolling). 

To catch tweets the millisecond they render, we instantiated a `MutationObserver` on the `document.body`. This API allows the browser to fire a callback function the exact moment React mounts a new node.

### DOM Querying Strategy
Twitter obfuscates its CSS class names (e.g., `css-1dbjc4n r-1niwhzg`). Relying on classes guarantees the extension will break during Twitter's next update.
Instead, we targeted React test IDs, which are stable markers left by Twitter's engineers for automated testing:
1. `article[data-testid="tweet"]`: The main container for the post.
2. `[data-testid="tweetText"]`: The specific `<span>` or `<div>` holding the text content.

## Asynchronous Background Processing
Once text is extracted, the content script cannot make a direct HTTP request to our local AI backend due to CORS (Cross-Origin Resource Sharing) restrictions enforced by the browser on `x.com`.

### The Manifest V3 Messaging Bridge
1. The content script calls `chrome.runtime.sendMessage()`, serializing the tweet payload.
2. The `background.js` Service Worker (which operates completely independent of the DOM and ignores CORS if granted `host_permissions`) receives the payload.
3. The background script executes a `fetch()` POST request to our FastAPI backend (`http://localhost:8000/analyze/text`).

## Dynamic DOM Mutation
When the FastAPI backend passes the text through the fine-tuned BERTweet model and returns `is_safe: false`, the background script replies to the content script.

The content script executes `hidePost(post)`:
```css
.ai-hidden {
  display: none !important;
}
```
It immediately constructs a new Yellow Warning DOM Node and uses `post.element.parentNode.insertBefore(warningBox, post.element)` to drop the AI safety shield directly into the user's feed, effectively neutralizing the toxicity before the user is forced to process it.

## Firefox (Gecko) Compatibility
Google Chrome supports Manifest V3 natively, but Mozilla Firefox requires specific metadata to load local or unsigned extensions. We injected the `browser_specific_settings` block:
```json
"browser_specific_settings": {
  "gecko": {
    "id": "aifeedshield@canyouhackit.org",
    "strict_min_version": "109.0"
  }
}
```
This satisfies the Mozilla Add-on parser, allowing the exact same codebase to run flawlessly on Firefox via `about:debugging`.
