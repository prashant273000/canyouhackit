/**
 * A platform-independent post passed to later moderation stages.
 * @typedef {Object} UniversalPost
 * @property {string} id Stable platform-specific post identifier.
 * @property {string} platform Source platform, for example "demo".
 * @property {string} type Post type supplied by the adapter.
 * @property {string} text Main post text.
 * @property {string[]} images Absolute image URLs associated with the post.
 * @property {string|null} parentText Text from the parent post when available.
 * @property {Element} element Original DOM element for later UI updates.
 * @property {Object} metadata Context fields supplied by the adapter.
 */

function createUniversalPost(fields) {
  return {
    id: fields.id,
    platform: fields.platform,
    type: fields.type,
    text: fields.text,
    images: fields.images,
    parentText: fields.parentText,
    element: fields.element,
    metadata: fields.metadata
  };
}
