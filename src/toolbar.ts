import { ToolbarItem } from './types';

/**
 * SVG icon definitions for toolbar buttons
 */
export const icons: Record<string, string> = {
  bold: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>',
  italic: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>',
  underline: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>',
  strikethrough: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>',
  heading1: '<svg viewBox="0 0 24 24" width="18" height="18"><text x="3" y="18" font-size="16" font-weight="bold" fill="currentColor" font-family="sans-serif">H1</text></svg>',
  heading2: '<svg viewBox="0 0 24 24" width="18" height="18"><text x="3" y="18" font-size="16" font-weight="bold" fill="currentColor" font-family="sans-serif">H2</text></svg>',
  heading3: '<svg viewBox="0 0 24 24" width="18" height="18"><text x="3" y="18" font-size="16" font-weight="bold" fill="currentColor" font-family="sans-serif">H3</text></svg>',
  unorderedList: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>',
  orderedList: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>',
  justifyLeft: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>',
  justifyCenter: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>',
  justifyRight: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
  image: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
  code: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
  undo: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
  redo: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>',
  blockquote: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>',
  horizontalRule: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M2 11h20v2H2z"/></svg>',
  removeFormat: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/></svg>',
  textColor: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11 2L5.5 16h2.25l1.12-3h6.25l1.12 3h2.25L13 2h-2zm-1.38 9L12 4.67 14.38 11H9.62z"/></svg>',
  bgColor: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/><rect fill="currentColor" x="3" y="19" width="18" height="4"/></svg>',
};

/**
 * Default toolbar configuration
 */
export const defaultToolbar: ToolbarItem[] = [
  { type: 'button', name: 'undo', icon: 'undo', tooltip: 'Undo', command: 'undo' },
  { type: 'button', name: 'redo', icon: 'redo', tooltip: 'Redo', command: 'redo' },
  { type: 'separator' },
  { type: 'button', name: 'bold', icon: 'bold', tooltip: 'Bold (Ctrl+B)', command: 'bold' },
  { type: 'button', name: 'italic', icon: 'italic', tooltip: 'Italic (Ctrl+I)', command: 'italic' },
  { type: 'button', name: 'underline', icon: 'underline', tooltip: 'Underline (Ctrl+U)', command: 'underline' },
  { type: 'button', name: 'strikethrough', icon: 'strikethrough', tooltip: 'Strikethrough', command: 'strikeThrough' },
  { type: 'separator' },
  { type: 'button', name: 'heading1', icon: 'heading1', tooltip: 'Heading 1', command: 'formatBlock', value: 'H1' },
  { type: 'button', name: 'heading2', icon: 'heading2', tooltip: 'Heading 2', command: 'formatBlock', value: 'H2' },
  { type: 'button', name: 'heading3', icon: 'heading3', tooltip: 'Heading 3', command: 'formatBlock', value: 'H3' },
  { type: 'separator' },
  { type: 'button', name: 'justifyLeft', icon: 'justifyLeft', tooltip: 'Align Left', command: 'justifyLeft' },
  { type: 'button', name: 'justifyCenter', icon: 'justifyCenter', tooltip: 'Align Center', command: 'justifyCenter' },
  { type: 'button', name: 'justifyRight', icon: 'justifyRight', tooltip: 'Align Right', command: 'justifyRight' },
  { type: 'separator' },
  { type: 'button', name: 'unorderedList', icon: 'unorderedList', tooltip: 'Bullet List', command: 'insertUnorderedList' },
  { type: 'button', name: 'orderedList', icon: 'orderedList', tooltip: 'Numbered List', command: 'insertOrderedList' },
  { type: 'button', name: 'blockquote', icon: 'blockquote', tooltip: 'Block Quote', command: 'formatBlock', value: 'BLOCKQUOTE' },
  { type: 'separator' },
  { type: 'button', name: 'link', icon: 'link', tooltip: 'Insert Link', command: 'createLink' },
  { type: 'button', name: 'image', icon: 'image', tooltip: 'Insert Image', command: 'insertImage' },
  { type: 'button', name: 'horizontalRule', icon: 'horizontalRule', tooltip: 'Horizontal Line', command: 'insertHorizontalRule' },
  { type: 'separator' },
  { type: 'button', name: 'code', icon: 'code', tooltip: 'Code Block', command: 'formatBlock', value: 'PRE' },
  { type: 'button', name: 'removeFormat', icon: 'removeFormat', tooltip: 'Clear Formatting', command: 'removeFormat' },
];