const posts = [
  {
    id: "p1",
    author: "Alice",
    text: "Just had a lovely walk in the park! 🌳",
    type: "safe"
  },
  {
    id: "p2",
    author: "Troll99",
    text: "You are absolutely pathetic and nobody likes you.",
    type: "toxic"
  },
  {
    id: "p3",
    author: "BullyGuy",
    text: "I'm going to find where you live and make you pay.",
    type: "harassment"
  },
  {
    id: "p4",
    author: "HateBot",
    text: "All people from [Group] are scum and should be exiled.",
    type: "hate"
  },
  {
    id: "p5",
    author: "NewsNews",
    text: "Breaking: Escalating war and violent conflicts reported in the region.",
    type: "semantic-trigger"
  },
  {
    id: "p6",
    author: "Photographer",
    text: "Beautiful sunset today.",
    image: "https://dummyimage.com/600x400/282c34/61dafb.png&text=nsfw_test_trigger",
    type: "safe-image"
  },
  {
    id: "p7",
    author: "GorePoster",
    text: "Check out this gruesome accident scene.",
    image: "https://m.media-amazon.com/images/I/81kl8UctwsL._UF1000,1000_QL80_.jpg",
    type: "nsfw-graphic"
  },
  {
    id: "p8",
    author: "Bob",
    text: "What do you think about the new movie?",
    comments: [
      { id: "c1", author: "Charlie", text: "I loved it, great acting!" },
      { id: "c2", author: "Dave", text: "You're an idiot if you liked that garbage." },
      { id: "c3", author: "Charlie", text: "Wow, no need to be toxic." }
    ]
  }
];

function createPostElement(post) {
  const article = document.createElement('article');
  article.className = 'post';
  article.dataset.postId = post.id;
  
  let html = `<div class="post-author">${post.author}</div>`;
  html += `<div class="post-content">${post.text}</div>`;
  
  if (post.image) {
    html += `<img class="post-image" src="${post.image}" alt="Post image">`;
  }
  
  if (post.comments && post.comments.length > 0) {
    html += `<div class="comments-section">`;
    post.comments.forEach(c => {
      html += `<div class="comment" data-comment-id="${c.id}"><strong>${c.author}:</strong> ${c.text}</div>`;
    });
    html += `</div>`;
  }
  
  article.innerHTML = html;
  return article;
}

const container = document.getElementById('feed-container');
posts.forEach(post => {
  container.appendChild(createPostElement(post));
});

// Handle new posts
document.getElementById('post-btn').addEventListener('click', () => {
  const textarea = document.getElementById('compose-textarea');
  const text = textarea.value.trim();
  if (text) {
    const newPost = {
      id: 'p' + Date.now(),
      author: 'You',
      text: text
    };
    container.insertBefore(createPostElement(newPost), container.firstChild);
    textarea.value = '';
  }
});
