# Universal Parser

## Purpose

Normalize website-specific post DOM into a stable structure that later moderation stages can
consume without knowing which platform produced it.

## UniversalPost Schema

| Field | Description |
| --- | --- |
| `id` | Stable platform-specific post identifier. |
| `platform` | Platform name supplied by the adapter. |
| `type` | Adapter-provided content type. |
| `text` | Main text extracted from the post. |
| `images` | Absolute URLs for associated images. |
| `parentText` | Parent post text when the platform exposes it. |
| `element` | Original DOM `Element`, retained for later UI changes. |
| `metadata` | Context fields such as author, timestamps, parent/thread identifiers, permalink, and tags when available. |

## How the Parser Works

- `UniversalContentParser` receives platform adapters and emits only `UniversalPost` objects.
- The initial adapter, `DemoFeedAdapter`, recognizes the `data-demo-post` convention and
  extracts post fields from associated `data-*` attributes and child elements.
- The parser tracks processed DOM elements and post IDs, preventing repeated handling of the
  same element or duplicate platform ID.
- A `MutationObserver` scans added content and qualifying attribute changes for new posts.
- Future `reddit`, `x`, `instagram`, and `generic` adapters can implement the same adapter
  interface without changing downstream consumers of `UniversalPost`.

## Known Limitations

- Only the demo-feed `data-demo-post` convention is supported now.
- Shadow DOM, iframes, and content loaded outside the observed document are not handled.
- Text and image extraction is intentionally basic and depends on the demo-feed markup.
- No AI analysis, backend calls, UI moderation, or platform-specific production adapter is included.

## TODO

- Add platform adapters only after their target markup and supported behavior are agreed.
- Decide how long-lived parser state should be managed for navigation-heavy sites.
