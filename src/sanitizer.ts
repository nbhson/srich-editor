/**
 * HTML Sanitizer for SRich Editor
 * Strips dangerous elements, attributes, and protocols to prevent XSS attacks.
 */

/** Dangerous HTML elements that should be removed (with their content) */
const DANGEROUS_ELEMENTS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'textarea',
  'select',
  'button',
  'link',
  'meta',
  'style',
  'base',
  'noscript',
  'template',
  'slot',
  'shadow',
]);

/** Dangerous HTML elements that should be unwrapped (content kept, tag removed) */
const UNWRAP_ELEMENTS = new Set(['font', 'center']);

/** Attributes that match this pattern are dangerous (event handlers, etc.) */
const DANGEROUS_ATTR_PATTERNS = [
  /^on/i,            // onclick, onload, onerror, etc.
  /expression\(/i,   // CSS expression()
  /url\(/i,          // CSS url()
  /javascript:/i,    // javascript: in style
  /vbscript:/i,      // vbscript: in style
];

/** Safe URL protocols allowed for links */
const SAFE_LINK_PROTOCOLS = new Set([
  'http:',
  'https:',
  'mailto:',
  'tel:',
  'ftp:',
  '#',
  '',
]);

/** Safe URL protocols allowed for images */
const SAFE_IMAGE_PROTOCOLS = new Set([
  'http:',
  'https:',
  'data:',
]);

/**
 * Sanitize an HTML string by removing dangerous elements and attributes.
 * @param html - The raw HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;

  sanitizeNode(body);

  return body.innerHTML;
}

/**
 * Recursively sanitize a DOM node and its children.
 */
function sanitizeNode(node: Node): void {
  const childNodes = Array.from(node.childNodes);

  for (const child of childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      // Remove dangerous elements entirely (including content)
      if (DANGEROUS_ELEMENTS.has(tagName)) {
        el.remove();
        continue;
      }

      // Unwrap certain elements (keep content, remove tag)
      if (UNWRAP_ELEMENTS.has(tagName)) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          el.remove();
        }
        continue;
      }

      // Remove dangerous attributes
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        const attrName = attr.name.toLowerCase();
        const attrValue = attr.value;

        // Check against dangerous patterns
        const isDangerous = DANGEROUS_ATTR_PATTERNS.some(pattern => pattern.test(attrName));
        if (isDangerous) {
          el.removeAttribute(attr.name);
          continue;
        }

        // Check for dangerous attribute names
        if (['srcdoc', 'dynsrc', 'lowsrc', 'action', 'formaction', 'xlink:href'].includes(attrName)) {
          el.removeAttribute(attr.name);
          continue;
        }

        // For style attribute, check for dangerous values
        if (attrName === 'style') {
          const safeStyle = sanitizeStyle(attrValue);
          if (safeStyle) {
            el.setAttribute('style', safeStyle);
          } else {
            el.removeAttribute('style');
          }
          continue;
        }

        // For href/src/action attributes, check for dangerous protocols
        if (['href', 'src', 'action', 'poster', 'background'].includes(attrName)) {
          if (!isSafeURL(attrValue)) {
            el.removeAttribute(attr.name);
          }
        }
      }

      // Recurse into children
      sanitizeNode(el);
    }
  }
}

/**
 * Check if a URL is safe (no dangerous protocols).
 */
function isSafeURL(url: string): boolean {
  if (!url) return true;

  const trimmed = url.trim().toLowerCase();

  // Allow relative URLs
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../') || !trimmed.includes(':')) {
    return true;
  }

  // Allow anchor-only URLs
  if (trimmed.startsWith('#')) {
    return true;
  }

  // Check protocol
  const protocolMatch = trimmed.match(/^([a-z][a-z0-9+.-]*):/);
  if (!protocolMatch) return true;

  const protocol = protocolMatch[1] + ':';
  return SAFE_LINK_PROTOCOLS.has(protocol);
}

/**
 * Sanitize a CSS style string, removing dangerous expressions.
 */
function sanitizeStyle(style: string): string {
  if (!style) return '';

  const dangerousPatterns = [
    /expression\s*\(/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /url\s*\(\s*['"]?\s*javascript:/i,
    /-moz-binding/i,
    /behavior\s*:/i,
  ];

  if (dangerousPatterns.some(pattern => pattern.test(style))) {
    return '';
  }

  return style;
}

/**
 * Validate a URL for use in links.
 * Only allows safe protocols: http, https, mailto, tel, ftp, and fragment-only (#).
 * @param url - The URL to validate
 * @returns The validated URL, or empty string if invalid
 */
export function sanitizeLinkURL(url: string): string {
  if (!url) return '';

  const trimmed = url.trim();

  // Allow fragment-only URLs
  if (trimmed.startsWith('#')) {
    return trimmed;
  }

  // Allow relative URLs
  if (!trimmed.includes(':') || trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (SAFE_LINK_PROTOCOLS.has(protocol)) {
      return trimmed;
    }
    // Protocol not allowed — try prepending https
    const withHttps = new URL('https://' + trimmed);
    return withHttps.href;
  } catch {
    // Invalid URL — return empty
    return '';
  }
}

/**
 * Validate a URL for use in images.
 * Only allows safe protocols: http, https, and data:image/*.
 * @param url - The URL to validate
 * @returns The validated URL, or empty string if invalid
 */
export function sanitizeImageURL(url: string): string {
  if (!url) return '';

  const trimmed = url.trim();

  // Allow relative URLs
  if (!trimmed.includes(':') || trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();

    // Allow http/https
    if (protocol === 'http:' || protocol === 'https:') {
      return trimmed;
    }

    // Allow data: only for images
    if (protocol === 'data:') {
      const contentType = parsed.pathname.split(';')[0].split(',')[0].toLowerCase();
      if (contentType.startsWith('image/')) {
        return trimmed;
      }
      return '';
    }

    return '';
  } catch {
    return '';
  }
}