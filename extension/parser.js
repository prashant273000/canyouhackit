class UniversalContentParser {
  constructor(adapters) {
    this.adapters = adapters;
    this.processedElements = new WeakSet();
    this.processedIds = new Set();
    this.observer = null;
  }

  scan(root = document) {
    const posts = [];

    for (const adapter of this.adapters) {
      for (const element of adapter.findPostElements(root)) {
        const post = this.normalizeElement(adapter, element);
        if (post) {
          posts.push(post);
        }
      }
    }

    return posts;
  }

  start(root = document, onPost) {
    this.scan(root).forEach(onPost);
    this.stop();

    const observeTarget = root instanceof Document ? root.documentElement : root;
    this.observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes") {
          this.scan(record.target).forEach(onPost);
          continue;
        }

        for (const node of record.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scan(node).forEach(onPost);
          }
        }
      }
    });

    this.observer.observe(observeTarget, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-demo-post", "data-post-id"]
    });
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
  }

  normalizeElement(adapter, element) {
    if (this.processedElements.has(element)) {
      return null;
    }

    const post = adapter.normalize(element);
    if (this.processedIds.has(post.id)) {
      this.processedElements.add(element);
      return null;
    }

    this.processedElements.add(element);
    this.processedIds.add(post.id);
    return post;
  }
}
