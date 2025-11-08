/**
 * @file secureRender.js
 * @path htdocs/src/security/secureRender.js
 * @description Secure HTML rendering utilities with XSS protection
 */

/**
 * Securely injects sanitized HTML into a DOM element
 * Sanitizes tags and attributes, validates and annotates links, and prevents XSS via innerHTML
 * @param {HTMLElement} targetEl - The DOM element to inject into
 * @param {string} source - The raw HTML string to sanitize and inject
 * @returns {void}
 * @throws {TypeError} If targetEl is not a valid DOM element
 * @example
 * const container = document.getElementById('content');
 * const html = '<p>Hello <script>alert("XSS")</script></p>';
 * secureRender(container, html); // Renders: <p>Hello </p>
 */
export function secureRender(targetEl, source) {
  if (!targetEl || typeof targetEl.innerHTML !== 'string') {
    throw new TypeError('secureRender: targetEl must be a valid DOM element.');
  }

  if (typeof source !== 'string') {
    console.warn('secureRender: source is not a string. Rendering nothing.');
    targetEl.innerHTML = '';
    return;
  }

  const cleanHtml = sanitizeHTML(source);
  targetEl.innerHTML = cleanHtml;
}

/* ------------------------------------------
   Internal Helpers — Not exported
------------------------------------------- */

const SAFE_TAGS = new Set([
  'p',
  'a',
  'ul',
  'ol',
  'li',
  'code',
  'pre',
  'strong',
  'em',
  'b',
  'i',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
  'br',
  'hr',
]);

const SAFE_ATTRS = new Set(['href', 'title', 'class', 'id', 'rel', 'target']);

/**
 * Sanitizes HTML content by removing unsafe tags and attributes
 * @param {string} [html=''] - Raw HTML content to sanitize
 * @returns {string} Sanitized HTML safe for rendering
 */
function sanitizeHTML(html = '') {
  const template = document.createElement('template');
  template.innerHTML = html;

  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);

  while (walker.nextNode()) {
    const el = walker.currentNode;
    const tag = el.tagName.toLowerCase();

    if (!SAFE_TAGS.has(tag)) {
      el.replaceWith(...el.childNodes);
      continue;
    }

    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();

      if (
        name.startsWith('on') ||
        value.toLowerCase().startsWith('javascript:') ||
        !SAFE_ATTRS.has(name)
      ) {
        el.removeAttribute(attr.name);
      }
    });

    if (tag === 'a') {
      el.href = sanitizeURL(el.getAttribute('href'));
      annotateOutbound(el);
    }
  }

  return template.innerHTML;
}

/**
 * Sanitizes URL input to prevent malicious redirects
 * @param {string} input - Raw URL string to sanitize
 * @returns {string} Sanitized URL or '#' if invalid
 */
function sanitizeURL(input) {
  if (typeof input !== 'string' || input.trim() === '') return '#';
  const u = input.trim();
  if (u.startsWith('#') || u.startsWith('/') || u.startsWith('./') || u.startsWith('../'))
    return u;

  try {
    const url = new URL(u, location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
  } catch {
    return '#';
  }
}

/**
 * Annotates outbound links with security attributes
 * @param {HTMLAnchorElement} a - Anchor element to annotate
 * @returns {HTMLAnchorElement} The annotated anchor element
 */
function annotateOutbound(a) {
  try {
    const u = new URL(a.href, location.origin);
    if (u.origin !== location.origin) {
      a.rel = 'noopener noreferrer';
      a.target = '_blank';
    }
  } catch {
    // Ignore malformed URLs
  }
  return a;
}
