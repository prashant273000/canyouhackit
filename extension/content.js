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
      <strong>Content Hidden</strong><br>
      Reason: ${reason}<br>
      <button class="ai-reveal-btn">Show Anyway</button>
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
