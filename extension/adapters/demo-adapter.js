class DemoFeedAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.fallbackIds = new WeakMap();
    this.nextFallbackId = 1;
  }

  matches(element) {
    return element instanceof Element && element.matches("[data-demo-post]");
  }

  findPostElements(root) {
    const posts = [];

    if (root instanceof Element && this.matches(root)) {
      posts.push(root);
    }

    if (root.querySelectorAll) {
      posts.push(...root.querySelectorAll("[data-demo-post]"));
    }

    return posts;
  }

  normalize(element) {
    const textElement = element.querySelector("[data-demo-post-text]");
    const parentTextElement = element.querySelector("[data-demo-parent-text]");
    const id = element.dataset.postId || this.getFallbackId(element);

    return createUniversalPost({
      id,
      platform: "demo",
      type: element.dataset.postType || "post",
      text: textElement?.textContent.trim() || element.dataset.text || "",
      images: [...element.querySelectorAll("[data-demo-post-image], img")]
        .map((image) => image.currentSrc || image.src)
        .filter(Boolean),
      parentText: parentTextElement?.textContent.trim() || element.dataset.parentText || null,
      element,
      metadata: {
        adapter: "demo",
        author: element.dataset.author || null,
        createdAt: element.dataset.createdAt || null,
        parentId: element.dataset.parentId || null,
        threadId: element.dataset.threadId || null,
        permalink: element.dataset.permalink || null,
        tags: (element.dataset.tags || "").split(",").filter(Boolean)
      }
    });
  }

  getFallbackId(element) {
    if (!this.fallbackIds.has(element)) {
      this.fallbackIds.set(element, `demo-generated-${this.nextFallbackId}`);
      this.nextFallbackId += 1;
    }

    return this.fallbackIds.get(element);
  }
}
