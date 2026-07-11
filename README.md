# SRich Editor

A lightweight, dependency-free rich text editor built with Vanilla JavaScript.

[![npm version](https://img.shields.io/npm/v/srich-editor.svg)](https://www.npmjs.com/package/srich-editor)
[![license](https://img.shields.io/npm/l/srich-editor.svg)](https://github.com/nbhson/srich-editor/blob/main/LICENSE)

## Features

- 🚀 **Lightweight** - No dependencies, tiny bundle size
- 🎨 **Customizable** - Configurable toolbar and styling
- 🌙 **Dark Mode** - Automatic dark mode support
- ♿ **Accessible** - ARIA labels and keyboard shortcuts
- 📱 **Responsive** - Works on all screen sizes
- 🔧 **Simple API** - Easy to integrate and use
- ⌨️ **Keyboard Shortcuts** - Ctrl+B, Ctrl+I, Ctrl+U support
- 📊 **Status Bar** - Word and character count

## Installation

```bash
npm install srich-editor
```

## Quick Start

### Using ES Modules (Recommended)

```javascript
import { createEditor } from 'srich-editor';
import 'srich-editor/dist/styles.css';

const editor = createEditor({
  container: '#editor',
  placeholder: 'Start typing here...',
  onChange: (content) => {
    console.log('Content changed:', content);
  },
});

// Get content
const html = editor.getContent();

// Set content
editor.setContent('<p>Hello World</p>');
```

### Using UMD (via script tag in plain HTML)

If you're using a bundler (Webpack, Vite, Parcel, etc.), install the package and use ES Modules:

```bash
npm install srich-editor
```

```javascript
import { createEditor } from 'srich-editor';
import 'srich-editor/dist/styles.css';

const editor = createEditor({
  container: '#editor',
  placeholder: 'Start typing here...',
});
```

#### Option 1: Via CDN (unpkg / jsDelivr)

No installation needed — just add these to your HTML `<head>`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
  <!-- 1. Load CSS -->
  <link rel="stylesheet" href="https://unpkg.com/srich-editor/dist/styles.css">
</head>
<body>
  <!-- 2. Add a container div -->
  <div id="editor"></div>

  <!-- 3. Load UMD script (exposes global `SRichEditor`) -->
  <script src="https://unpkg.com/srich-editor/dist/srich-editor.umd.js"></script>
  <script>
    const editor = SRichEditor.createEditor({
      container: '#editor',
      placeholder: 'Start typing here...',
      onChange: (content) => console.log(content),
    });
  </script>
</body>
</html>
```

> **Note:** When using the UMD build via `<script>` tag, the library is available as the global variable `SRichEditor`. Call `SRichEditor.createEditor(...)` to create an editor instance.

#### Option 2: Using importmap (modern browsers, no bundler)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
  <link rel="stylesheet" href="https://unpkg.com/srich-editor/dist/styles.css">
</head>
<body>
  <div id="editor"></div>

  <script type="importmap">
  {
    "imports": {
      "srich-editor": "https://unpkg.com/srich-editor/dist/srich-editor.esm.js"
    }
  }
  </script>
  <script type="module">
    import { createEditor } from 'srich-editor';

    const editor = createEditor({
      container: '#editor',
      placeholder: 'Start typing here...',
      onChange: (content) => console.log(content),
    });
  </script>
</body>
</html>
```

## API

### `createEditor(options)`

Creates a new editor instance.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `string \| HTMLElement` | **required** | CSS selector or DOM element |
| `content` | `string` | `''` | Initial HTML content |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text |
| `height` | `string` | `'300px'` | Editor height |
| `toolbar` | `ToolbarItem[]` | default toolbar | Custom toolbar config |
| `customButtons` | `CustomButton[]` | `[]` | Custom toolbar buttons |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `onChange` | `(content: string) => void` | - | Content change callback |
| `onReady` | `() => void` | - | Editor ready callback |

#### Editor Instance Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getContent()` | `string` | Get HTML content |
| `setContent(html)` | `void` | Set HTML content |
| `getText()` | `string` | Get plain text content |
| `getCharacterCount()` | `number` | Get character count |
| `getWordCount()` | `number` | Get word count |
| `execCommand(cmd, val?)` | `void` | Execute a command |
| `queryCommandState(cmd)` | `boolean` | Check if command is active |
| `focus()` | `void` | Focus the editor |
| `isEmpty()` | `boolean` | Check if editor is empty |
| `enable()` | `void` | Enable the editor |
| `disable()` | `void` | Disable the editor |
| `getElement()` | `HTMLElement` | Get wrapper element |
| `destroy()` | `void` | Remove the editor |
| `undo()` | `void` | Undo last change |
| `redo()` | `void` | Redo last undone change |
| `canUndo()` | `boolean` | Check if undo is available |
| `canRedo()` | `boolean` | Check if redo is available |

### Getting Content with `getContent()`

`getContent()` returns the current HTML content of the editor as a string. This is useful for saving or processing the editor's content.

```javascript
import { createEditor } from 'srich-editor';

const editor = createEditor({
  container: '#editor',
  placeholder: 'Start typing...',
});

// Get HTML content at any time
const html = editor.getContent();
console.log(html); // e.g. "<p>Hello <strong>World</strong></p>"

// Example: Save content on a button click
document.getElementById('save-btn').addEventListener('click', () => {
  const content = editor.getContent();
  // Send to server, save to localStorage, etc.
  fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
});

// Example: Check if editor has content before submitting
if (!editor.isEmpty()) {
  const html = editor.getContent();
  // proceed with form submission
}
```

#### Using `getContent()` with onChange callback

```javascript
const editor = createEditor({
  container: '#editor',
  onChange: (content) => {
    // 'content' is the same HTML string as getContent()
    console.log('Current HTML:', content);
  },
});
```

## Custom Toolbar

```javascript
import { createEditor } from 'srich-editor';
import { defaultToolbar } from 'srich-editor';

const editor = createEditor({
  container: '#editor',
  toolbar: [
    // Only show bold, italic, underline
    { type: 'button', name: 'bold', icon: 'bold', tooltip: 'Bold', command: 'bold' },
    { type: 'button', name: 'italic', icon: 'italic', tooltip: 'Italic', command: 'italic' },
    { type: 'button', name: 'underline', icon: 'underline', tooltip: 'Underline', command: 'underline' },
    { type: 'separator' },
    { type: 'button', name: 'link', icon: 'link', tooltip: 'Insert Link', command: 'createLink' },
  ],
});
```

## Available Toolbar Icons

The editor comes with 21 built-in toolbar icons:

| Icon | Command | Description |
|------|---------|-------------|
| `undo` | `undo` | Undo last action |
| `redo` | `redo` | Redo last action |
| `bold` | `bold` | Bold text |
| `italic` | `italic` | Italic text |
| `underline` | `underline` | Underline text |
| `strikethrough` | `strikeThrough` | Strikethrough text |
| `heading1` | `formatBlock: H1` | Heading level 1 |
| `heading2` | `formatBlock: H2` | Heading level 2 |
| `heading3` | `formatBlock: H3` | Heading level 3 |
| `justifyLeft` | `justifyLeft` | Align left |
| `justifyCenter` | `justifyCenter` | Align center |
| `justifyRight` | `justifyRight` | Align right |
| `unorderedList` | `insertUnorderedList` | Bullet list |
| `orderedList` | `insertOrderedList` | Numbered list |
| `blockquote` | `formatBlock: BLOCKQUOTE` | Block quote |
| `link` | `createLink` | Insert link (prompts for URL) |
| `image` | `insertImage` | Insert image (prompts for URL) |
| `horizontalRule` | `insertHorizontalRule` | Horizontal line |
| `code` | `formatBlock: PRE` | Code block |
| `removeFormat` | `removeFormat` | Clear formatting |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+U | Underline |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+Shift+Z | Redo (Mac) |

## Bundle Sizes

| File | Size | Format |
|------|------|--------|
| `srich-editor.umd.js` | ~24 KB | UMD (script tags) |
| `srich-editor.esm.js` | ~24 KB | ES Modules |
| `styles.css` | ~8 KB | CSS |
| **Total package** | **~24 KB** | minified |

## Framework Integration

### React

```jsx
import { useEffect, useRef } from 'react';
import { createEditor } from 'srich-editor';
import 'srich-editor/dist/styles.css';

function SRichEditor({ onChange }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    editorRef.current = createEditor({
      container: containerRef.current,
      onChange,
    });
    return () => editorRef.current?.destroy();
  }, []);

  return <div ref={containerRef} />;
}
```

### Vue

```vue
<template>
  <div ref="editorContainer"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { createEditor } from 'srich-editor';
import 'srich-editor/dist/styles.css';

const editorContainer = ref(null);
let editor = null;

onMounted(() => {
  editor = createEditor({
    container: editorContainer.value,
    onChange: (content) => console.log(content),
  });
});

onUnmounted(() => editor?.destroy());
</script>
```

### Angular

#### 1. Install the package

```bash
npm install srich-editor
```

#### 2. Create a wrapper component

**srich-editor.component.ts**

```typescript
import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { createEditor, RichEditorInstance } from 'srich-editor';
import 'srich-editor/dist/styles.css';

@Component({
  selector: 'app-srich-editor',
  standalone: true,
  imports: [CommonModule],
  template: `<div #editorContainer></div>`,
  styles: [`:host { display: block; }`],
})
export class SRichEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @Output() contentChanged = new EventEmitter<string>();
  @Input() placeholder = 'Start typing...';
  @Input() height = '300px';
  @Input() content = '';

  private editor!: RichEditorInstance;

  ngAfterViewInit(): void {
    this.editor = createEditor({
      container: this.editorContainer.nativeElement,
      placeholder: this.placeholder,
      height: this.height,
      content: this.content,
      onChange: (html: string) => this.contentChanged.emit(html),
    });
  }

  getContent(): string {
    return this.editor?.getContent() ?? '';
  }

  setContent(html: string): void {
    this.editor?.setContent(html);
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
```

#### 3. Use in a page

**app.component.ts**

```typescript
import { Component } from '@angular/core';
import { SRichEditorComponent } from './srich-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SRichEditorComponent],
  template: `
    <app-srich-editor
      placeholder="Write something..."
      (contentChanged)="onContentChange($event)">
    </app-srich-editor>
  `,
})
export class AppComponent {
  onContentChange(content: string) {
    console.log('Content:', content);
  }
}
```
## Development

```bash
# Install dependencies
npm install

# Development mode with watch
npm run dev

# Build for production
npm run build

# Open demo
npm run demo
```

## Publishing to npm

```bash
# Login to npm
npm login

# (Optional) Dry run to check what will be published
npm pack --dry-run

# Publish
npm publish

# Publish with tag
npm publish --tag beta

# Update version and publish
npm version patch  # or minor / major
npm publish
```

## Project Structure

```
srichEditor/
├── src/
│   ├── index.ts        # Entry point, exports
│   ├── types.ts        # TypeScript interfaces
│   ├── toolbar.ts      # Toolbar config + SVG icons
│   ├── editor.ts       # Core editor logic
│   ├── styles.css      # Editor styles (light + dark mode)
│   └── global.d.ts     # CSS module declaration
├── dist/               # Build output (git-ignored)
├── demo/
│   └── index.html      # Demo page
├── package.json
├── rollup.config.mjs   # Rollup build config
├── tsconfig.json       # TypeScript config
├── .gitignore
└── README.md
```

## License

MIT