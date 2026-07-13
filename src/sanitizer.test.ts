import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizeLinkURL, sanitizeImageURL } from './sanitizer';

describe('sanitizeHTML', () => {
  // ─── Basic functionality ───
  it('should return empty string for empty input', () => {
    expect(sanitizeHTML('')).toBe('');
    expect(sanitizeHTML(null as any)).toBe('');
    expect(sanitizeHTML(undefined as any)).toBe('');
  });

  it('should preserve safe HTML', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const result = sanitizeHTML(input);
    expect(result).toContain('Hello');
    expect(result).toContain('<strong>');
  });

  // ─── Dangerous elements ───
  it('should remove <script> tags and their content', () => {
    const input = '<p>Safe</p><script>alert("xss")</script><p>Also safe</p>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('Safe');
  });

  it('should remove <iframe> tags', () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<iframe>');
  });

  it('should remove <object> tags', () => {
    const input = '<object data="evil.swf"></object>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<object>');
  });

  it('should remove <embed> tags', () => {
    const input = '<embed src="evil.swf">';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<embed>');
  });

  it('should remove <form> tags', () => {
    const input = '<form action="https://evil.com"><input type="text"></form>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<form>');
    expect(result).not.toContain('<input>');
  });

  it('should remove <style> tags', () => {
    const input = '<style>body { background: url("javascript:alert(1)") }</style>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<style>');
  });

  it('should remove <template> tags', () => {
    const input = '<template><p>Hidden content</p></template>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<template>');
  });

  // ─── Unwrap elements ───
  it('should unwrap <font> tags but keep content', () => {
    const input = '<font color="red">text</font>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<font>');
    expect(result).toContain('text');
  });

  it('should unwrap <center> tags but keep content', () => {
    const input = '<center>centered text</center>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<center>');
    expect(result).toContain('centered text');
  });

  // ─── Dangerous attributes ───
  it('should remove onclick handlers', () => {
    const input = '<p onclick="alert(\'xss\')">text</p>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('onclick');
    expect(result).toContain('text');
  });

  it('should remove onload handlers', () => {
    const input = '<img src="x" onload="alert(\'xss\')">';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('onload');
  });

  it('should remove onerror handlers', () => {
    const input = '<img src="x" onerror="alert(\'xss\')">';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('onerror');
  });

  it('should remove all on* event handlers', () => {
    const input = '<div onmouseover="alert(1)" onfocus="alert(2)">text</div>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('onmouseover');
    expect(result).not.toContain('onfocus');
  });

  it('should remove srcdoc attribute', () => {
    const input = '<iframe srcdoc="<script>alert(1)</script>"></iframe>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('srcdoc');
  });

  // ─── Dangerous styles ───
  it('should remove styles with expression()', () => {
    const input = '<div style="width: expression(alert(1))">text</div>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('expression');
    expect(result).toContain('text');
  });

  it('should remove styles with javascript:', () => {
    const input = '<div style="background: url(javascript:alert(1))">text</div>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('javascript:');
  });

  it('should remove styles with -moz-binding', () => {
    const input = '<div style="-moz-binding: url(evil)">text</div>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('-moz-binding');
  });

  it('should preserve safe styles', () => {
    const input = '<p style="color: red; font-size: 14px;">text</p>';
    const result = sanitizeHTML(input);
    expect(result).toContain('color: red');
    expect(result).toContain('font-size: 14px');
  });

  // ─── Dangerous URLs in attributes ───
  it('should remove javascript: href on links', () => {
    const input = '<a href="javascript:alert(\'xss\')">click</a>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('javascript:');
    expect(result).toContain('click');
  });

  it('should remove vbscript: href on links', () => {
    const input = '<a href="vbscript:MsgBox(1)">click</a>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('vbscript:');
  });

  it('should remove data: href on links', () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">click</a>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('data:');
  });

  it('should preserve safe http/https links', () => {
    const input = '<a href="https://example.com">link</a>';
    const result = sanitizeHTML(input);
    expect(result).toContain('https://example.com');
  });

  it('should preserve mailto links', () => {
    const input = '<a href="mailto:test@example.com">email</a>';
    const result = sanitizeHTML(input);
    expect(result).toContain('mailto:test@example.com');
  });

  it('should remove javascript: src on images', () => {
    const input = '<img src="javascript:alert(1)">';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('javascript:');
  });

  // ─── Nested attacks ───
  it('should handle nested script tags', () => {
    const input = '<p>text</p><scr<script>ipt>alert("xss")</scr</script>ipt>';
    const result = sanitizeHTML(input);
    expect(result).toContain('text');
  });

  it('should handle multiple dangerous elements', () => {
    const input = '<script>alert(1)</script><iframe src="x"></iframe><object data="x"></object><p>safe</p>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<iframe>');
    expect(result).not.toContain('<object>');
    expect(result).toContain('safe');
  });

  it('should handle deeply nested content', () => {
    const input = '<div><p><strong><em>safe text</em></strong></p></div>';
    const result = sanitizeHTML(input);
    expect(result).toContain('safe text');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
  });
});

describe('sanitizeLinkURL', () => {
  it('should return empty string for empty input', () => {
    expect(sanitizeLinkURL('')).toBe('');
  });

  it('should allow https URLs', () => {
    expect(sanitizeLinkURL('https://example.com')).toBe('https://example.com');
  });

  it('should allow http URLs', () => {
    expect(sanitizeLinkURL('http://example.com')).toBe('http://example.com');
  });

  it('should allow mailto URLs', () => {
    expect(sanitizeLinkURL('mailto:test@example.com')).toBe('mailto:test@example.com');
  });

  it('should allow tel URLs', () => {
    expect(sanitizeLinkURL('tel:+1234567890')).toBe('tel:+1234567890');
  });

  it('should allow fragment-only URLs', () => {
    expect(sanitizeLinkURL('#section1')).toBe('#section1');
  });

  it('should allow relative URLs', () => {
    expect(sanitizeLinkURL('/about')).toBe('/about');
    expect(sanitizeLinkURL('./page')).toBe('./page');
    expect(sanitizeLinkURL('../other')).toBe('../other');
  });

  it('should block javascript: URLs', () => {
    const result = sanitizeLinkURL('javascript:alert(1)');
    expect(result).not.toContain('javascript:');
  });

  it('should block vbscript: URLs', () => {
    const result = sanitizeLinkURL('vbscript:MsgBox(1)');
    expect(result).not.toContain('vbscript:');
  });

  it('should block data: URLs for links', () => {
    const result = sanitizeLinkURL('data:text/html,<script>alert(1)</script>');
    expect(result).not.toContain('data:');
  });
});

describe('sanitizeImageURL', () => {
  it('should return empty string for empty input', () => {
    expect(sanitizeImageURL('')).toBe('');
  });

  it('should allow https image URLs', () => {
    expect(sanitizeImageURL('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
  });

  it('should allow http image URLs', () => {
    expect(sanitizeImageURL('http://example.com/photo.jpg')).toBe('http://example.com/photo.jpg');
  });

  it('should allow data:image URLs', () => {
    const input = 'data:image/png;base64,abc123';
    expect(sanitizeImageURL(input)).toBe(input);
  });

  it('should allow relative URLs', () => {
    expect(sanitizeImageURL('/images/photo.jpg')).toBe('/images/photo.jpg');
  });

  it('should block data:text/html URLs', () => {
    const result = sanitizeImageURL('data:text/html,<script>alert(1)</script>');
    expect(result).toBe('');
  });

  it('should block javascript: URLs', () => {
    const result = sanitizeImageURL('javascript:alert(1)');
    expect(result).not.toContain('javascript:');
  });

  it('should block vbscript: URLs', () => {
    const result = sanitizeImageURL('vbscript:MsgBox(1)');
    expect(result).not.toContain('vbscript:');
  });

  it('should block ftp: URLs for images', () => {
    const result = sanitizeImageURL('ftp://example.com/image.jpg');
    expect(result).toBe('');
  });

  it('should handle data:application URLs', () => {
    const result = sanitizeImageURL('data:application/pdf;base64,abc');
    expect(result).toBe('');
  });
});