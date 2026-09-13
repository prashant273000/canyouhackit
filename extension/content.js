console.log("AI Feed Shield: Content script loaded.");

const processedElements = new WeakSet();

class UniversalPost {
  constructor({ id, platform, type, text, images, parentText, element, metadata }) {
    this.id = id;
    this.platform = platform;
    this.type = type;
    this.text = text;
    this.images = images || [];
    this.parentText = parentText || null;
    this.element = element;
    this.metadata = metadata || {};
  }
}

function extractPostFromDemo(articleElement) {
  const id = articleElement.dataset.postId;
  const contentEl = articleElement.querySelector('.post-content');
  const text = contentEl ? contentEl.innerText : '';
  const imgEl = articleElement.querySelector('.post-image');
  const images = imgEl ? [imgEl.src] : [];
  
  return new UniversalPost({ id, platform: 'demo', type: 'post', text, images, element: articleElement });
}

function extractCommentFromDemo(commentElement, parentArticle) {
  const id = commentElement.dataset.commentId;
  const text = commentElement.innerText;
  const parentTextEl = parentArticle.querySelector('.post-content');
  const parentText = parentTextEl ? parentTextEl.innerText : '';
  
  return new UniversalPost({ id, platform: 'demo', type: 'comment', text, parentText, element: commentElement });
}

function hidePost(post) {
  post.element.classList.remove('ai-pending', 'ai-safe');
  post.element.classList.add('ai-hidden');
}

function showPost(post) {
  post.element.classList.remove('ai-pending', 'ai-hidden');
  post.element.classList.add('ai-safe');
  if (post.element.previousElementSibling && post.element.previousElementSibling.classList.contains('ai-warning-box')) {
    post.element.previousElementSibling.remove();
  }
}

function replaceWithWarning(post, reason) {
  hidePost(post);
  if (!post.element.previousElementSibling || !post.element.previousElementSibling.classList.contains('ai-warning-box')) {
    const warningBox = document.createElement('div');
    warningBox.className = 'ai-warning-box';
    warningBox.innerHTML = `
      <div class="x-warning-layout">
        <div class="x-avatar-col">
          <div class="x-avatar" style="display:flex;align-items:center;justify-content:center;background-color:#000;border:1px solid #333;"><svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:#fff;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg></div>
        </div>
        <div class="x-content-col">
          <div class="x-header">
            <span class="x-name">X</span>
            <svg viewBox="0 0 24 24" class="x-verified"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.867 3.45-.032.21-.047.424-.047.64 0 2.21 1.71 4 3.918 4 .61 0 1.187-.145 1.707-.408C9.645 21.575 10.762 22.5 12 22.5s2.355-.925 3.09-2.35c.52.263 1.097.408 1.707.408 2.21 0 3.918-1.79 3.918-4 0-.216-.015-.43-.047-.64 1.127-.704 1.867-1.99 1.867-3.45zm-11.46 5.826l-4.59-4.59 1.41-1.41 3.18 3.18 6.57-6.57 1.41 1.41-7.98 7.98z"></path></g></svg>
            <span class="x-handle">@grok · System</span>
          </div>
          <div class="x-body">
            This content was hidden by AI Field Shield to protect your feed.<br><br>
            <span style="color: #71767b;">Flagged for:</span> <strong>${reason}</strong>
          </div>
          <div class="x-actions">
            <button class="ai-reveal-btn">Show Anyway</button>
          </div>
        </div>
      </div>
    `;
    warningBox.querySelector('.ai-reveal-btn').addEventListener('click', () => {
      showPost(post);
    });
    post.element.parentNode.insertBefore(warningBox, post.element);
  }
}

function markPending(post) {
  post.element.classList.add('ai-pending');
}

function sendForAnalysis(post) {
  // Strip circular element ref before sending to background
  const payload = {
    id: post.id,
    platform: post.platform,
    type: post.type,
    text: post.text,
    images: post.images,
    parentText: post.parentText
  };

  chrome.runtime.sendMessage({ type: "ANALYZE_POST", post: payload }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn("Extension message error:", chrome.runtime.lastError);
      showPost(post); // Fail safe
      return;
    }
    
    if (response && response.is_safe === false) {
      replaceWithWarning(post, response.reason || "Flagged by AI");
    } else {
      showPost(post);
    }
  });
}

function processNewElements() {
  const posts = document.querySelectorAll('article.post');
  posts.forEach(postEl => {
    if (!processedElements.has(postEl)) {
      processedElements.add(postEl);
      const post = extractPostFromDemo(postEl);
      markPending(post);
      sendForAnalysis(post);
    }
  });

  const comments = document.querySelectorAll('.comment');
  comments.forEach(commentEl => {
    if (!processedElements.has(commentEl)) {
      processedElements.add(commentEl);
      const parentArticle = commentEl.closest('article.post');
      if (parentArticle) {
        const comment = extractCommentFromDemo(commentEl, parentArticle);
        markPending(comment);
        sendForAnalysis(comment);
      }
    }
  });
}

processNewElements();
const observer = new MutationObserver(processNewElements);
observer.observe(document.body, { childList: true, subtree: true });

// NODE 18: Pre-post toxicity checker
function observeTyping() {
  const textarea = document.getElementById('compose-textarea');
  if (!textarea) return;
  
  let timeout = null;
  textarea.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const text = textarea.value.trim();
      if (!text) return;
      
      try {
        const res = await fetch('http://localhost:8000/analyze/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 'draft', text: text })
        });
        const data = await res.json();
        
        let warning = document.getElementById('draft-warning');
        if (!data.is_safe) {
          if (!warning) {
            warning = document.createElement('div');
            warning.id = 'draft-warning';
            warning.style.color = 'red';
            warning.style.fontSize = '0.9em';
            warning.style.marginTop = '5px';
            textarea.parentNode.appendChild(warning);
          }
          warning.innerText = `Warning: Draft looks toxic (${data.reason}). Consider rewriting.`;
        } else if (warning) {
          warning.remove();
        }
      } catch (e) {}
    }, 1000);
  });
}
setTimeout(observeTyping, 1000); // init

// NODE 23: Conversation toxicity escalation
let recentToxicityScores = [];
function trackEscalation(post, isSafe) {
  if (!isSafe) {
    recentToxicityScores.push(1);
  } else {
    recentToxicityScores.push(0);
  }
  if (recentToxicityScores.length > 5) recentToxicityScores.shift();
  
  const toxicCount = recentToxicityScores.filter(x => x === 1).length;
  if (toxicCount >= 3) {
    console.warn("Conversation Escalating! Showing alert...");
    if (!document.getElementById('escalation-alert')) {
      const alert = document.createElement('div');
      alert.id = 'escalation-alert';
      alert.style.position = 'fixed';
      alert.style.bottom = '10px';
      alert.style.right = '10px';
      alert.style.background = 'red';
      alert.style.color = 'white';
      alert.style.padding = '15px';
      alert.style.zIndex = '9999';
      alert.innerText = "WARNING: Conversation is escalating in toxicity.";
      document.body.appendChild(alert);
      setTimeout(() => alert.remove(), 5000);
    }
  }
}

// Hook into existing function
const originalSendForAnalysis = sendForAnalysis;
sendForAnalysis = function(post) {
  const payload = {
    id: post.id,
    platform: post.platform,
    type: post.type,
    text: post.text,
    images: post.images,
    parentText: post.parentText
  };

  chrome.runtime.sendMessage({ type: "ANALYZE_POST", post: payload }, (response) => {
    if (chrome.runtime.lastError) {
      showPost(post);
      return;
    }
    
    if (response && response.is_safe === false) {
      replaceWithWarning(post, response.reason || "Flagged by AI");
      trackEscalation(post, false);
    } else {
      showPost(post);
      trackEscalation(post, true);
    }
  });
};
