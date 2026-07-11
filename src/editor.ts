import { RichEditorOptions, RichEditorInstance, CustomButton } from './types';
import { icons, defaultToolbar } from './toolbar';
import { showLinkDialog, showImageDialog } from './dialog';

/**
 * Default editor options
 */
const defaultOptions: Partial<RichEditorOptions> = {
  content: '',
  placeholder: 'Start typing...',
  height: '300px',
  readOnly: false,
  maxLength: 0,
  maxUndoLevels: 100,
  autoFocus: false,
};

/**
 * Default locale strings (English)
 */
const defaultLocale = {
  words: 'words',
  characters: 'characters',
  insertLink: 'Insert Link',
  editLink: 'Edit Link',
  insertImage: 'Insert Image',
  editImage: 'Edit Image',
  displayText: 'Display Text',
  url: 'URL',
  imageUrl: 'Image URL',
  altText: 'Alt Text',
  preview: 'Preview',
  cancel: 'Cancel',
  insert: 'Insert',
  save: 'Save',
  removeLink: 'Remove Link',
  close: 'Close',
  unableToLoadImage: 'Unable to load image',
};

/**
 * Creates a new SRich Editor instance
 */
export function createEditor(options: RichEditorOptions): RichEditorInstance {
  const config = { ...defaultOptions, ...options };
  const locale = { ...defaultLocale, ...config.locale };

  // Resolve container element
  let containerEl: HTMLElement;
  if (typeof config.container === 'string') {
    const el = document.querySelector(config.container);
    if (!el) {
      throw new Error(`SRich Editor: Container element not found for selector "${config.container}"`);
    }
    containerEl = el as HTMLElement;
  } else {
    containerEl = config.container;
  }

  // Create editor DOM structure
  const wrapper = document.createElement('div');
  wrapper.className = 're-wrapper';
  wrapper.setAttribute('dir', 'ltr'); // Default direction, can be overridden

  // Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 're-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Formatting toolbar');

  // Content area
  const contentArea = document.createElement('div');
  contentArea.className = 're-content';
  contentArea.setAttribute('contenteditable', 'true');
  contentArea.setAttribute('role', 'textbox');
  contentArea.setAttribute('aria-multiline', 'true');
  contentArea.setAttribute('aria-label', 'Rich text editor');
  contentArea.style.minHeight = config.height || '300px';

  // Placeholder
  const placeholder = document.createElement('div');
  placeholder.className = 're-placeholder';
  placeholder.textContent = config.placeholder || 'Start typing...';

  // Status bar
  const statusBar = document.createElement('div');
  statusBar.className = 're-statusbar';
  statusBar.setAttribute('aria-live', 'polite');

  // Assemble
  wrapper.appendChild(toolbar);
  wrapper.appendChild(document.createElement('div')).className = 're-content-wrapper';
  const contentWrapper = wrapper.querySelector('.re-content-wrapper') as HTMLElement;
  contentWrapper.appendChild(placeholder);
  contentWrapper.appendChild(contentArea);
  wrapper.appendChild(statusBar);
  containerEl.appendChild(wrapper);

  // ─────────── State ───────────
  let isDisabled = false;
  let currentClassName = config.className || '';

  // ─────────── Custom Undo/Redo Stack ───────────
  const undoStack: string[] = [];
  const redoStack: string[] = [];
  const maxUndoLevels = config.maxUndoLevels || 100;
  let isUndoRedoAction = false;
  let lastSavedContent = '';

  /** Save current state to undo stack */
  function saveToUndoStack(): void {
    if (isUndoRedoAction) return;
    const current = contentArea.innerHTML;
    if (current === lastSavedContent) return;
    undoStack.push(lastSavedContent);
    if (undoStack.length > maxUndoLevels) {
      undoStack.shift();
    }
    lastSavedContent = current;
    redoStack.length = 0; // Clear redo on new change
    updateUndoRedoButtons();
  }

  /** Initialize the undo stack with current content */
  function initUndoStack(): void {
    lastSavedContent = contentArea.innerHTML;
    undoStack.length = 0;
    redoStack.length = 0;
    updateUndoRedoButtons();
  }

  function updateUndoRedoButtons(): void {
    const undoBtn = toolbar.querySelector('[data-command="undo"]') as HTMLElement | null;
    const redoBtn = toolbar.querySelector('[data-command="redo"]') as HTMLElement | null;
    if (undoBtn) {
      undoBtn.classList.toggle('re-disabled', undoStack.length === 0);
      undoBtn.setAttribute('aria-disabled', String(undoStack.length === 0));
    }
    if (redoBtn) {
      redoBtn.classList.toggle('re-disabled', redoStack.length === 0);
      redoBtn.setAttribute('aria-disabled', String(redoStack.length === 0));
    }
  }

  // ─────────── Toolbar State ───────────
  function updatePlaceholder(): void {
    const isEmpty = contentArea.textContent?.trim() === '' &&
      contentArea.innerHTML.replace(/<br\s*\/?>/gi, '').trim() === '';
    placeholder.style.display = isEmpty ? 'block' : 'none';
  }

  function updateToolbarState(): void {
    const buttons = toolbar.querySelectorAll('.re-btn[data-command]') as NodeListOf<HTMLElement>;
    buttons.forEach((btn) => {
      const command = btn.dataset.command;
      const value = btn.dataset.value;
      if (command && command !== 'undo' && command !== 'redo') {
        let isActive = false;
        try {
          if (command === 'formatBlock' && value) {
            isActive = document.queryCommandValue('formatBlock').toUpperCase() === value.toUpperCase();
          } else {
            isActive = document.queryCommandState(command);
          }
        } catch {
          // Some commands may throw
        }
        btn.classList.toggle('re-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      }
    });
    updateUndoRedoButtons();
  }

  function updateStatusBar(): void {
    const text = contentArea.textContent || '';
    const chars = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    statusBar.textContent = `${words} ${locale.words} · ${chars} ${locale.characters}`;
  }

  // ─────────── Performance: Throttle helper ───────────
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;
  function throttledHandleInput(): void {
    if (throttleTimer) return;
    throttleTimer = setTimeout(() => {
      throttleTimer = null;
      handleInput();
    }, 0); // Batch into next microtask
  }

  function handleInput(): void {
    updatePlaceholder();
    updateStatusBar();
    updateToolbarState();
    if (config.onChange) {
      config.onChange(contentArea.innerHTML);
    }
  }

  // ─────────── maxLength enforcement ───────────
  function checkMaxLength(): boolean {
    if (!config.maxLength || config.maxLength <= 0) return true;
    const text = contentArea.textContent || '';
    if (text.length > config.maxLength) {
      contentArea.innerHTML = lastSavedContent;
      return false;
    }
    return true;
  }

  // ─────────── Selection helpers ───────────
  function getSelectionInfo(): { selectedText: string; linkUrl: string | null; linkNode: HTMLAnchorElement | null } {
    const selection = window.getSelection();
    let selectedText = '';
    let linkUrl: string | null = null;
    let linkNode: HTMLAnchorElement | null = null;

    if (selection && selection.rangeCount > 0) {
      selectedText = selection.toString();

      let node = selection.anchorNode;
      while (node && node !== contentArea) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'A') {
          linkNode = node as HTMLAnchorElement;
          linkUrl = linkNode.getAttribute('href') || '';
          if (!selectedText) {
            selectedText = linkNode.textContent || '';
          }
          break;
        }
        node = node.parentNode;
      }
    }

    return { selectedText, linkUrl, linkNode };
  }

  function saveSelection(): Range | null {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange();
    }
    return null;
  }

  function restoreSelection(savedRange: Range | null): boolean {
    if (!savedRange) return false;
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
      return true;
    }
    return false;
  }

  // ─────────── Link handling ───────────
  async function handleCreateLink(): Promise<void> {
    const { selectedText, linkUrl, linkNode } = getSelectionInfo();
    const savedRange = saveSelection();

    const result = await showLinkDialog(selectedText, linkUrl || '', locale);

    if (result) {
      saveToUndoStack();

      if (result.action === 'remove') {
        if (linkNode) {
          const textNode = document.createTextNode(linkNode.textContent || '');
          linkNode.parentNode?.replaceChild(textNode, linkNode);
          handleInput();
        }
        return;
      }

      if (linkNode) {
        linkNode.setAttribute('href', result.url);
        if (result.text && linkNode.textContent !== result.text) {
          linkNode.textContent = result.text;
        }
        handleInput();
      } else {
        contentArea.focus();
        restoreSelection(savedRange);

        if (selectedText) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (contentArea.contains(range.commonAncestorContainer)) {
              const selectedContent = range.extractContents();
              const anchor = document.createElement('a');
              anchor.href = result.url;
              // Use textContent OR appendChild, not both — otherwise text is duplicated
              if (result.text && result.text !== selectedText) {
                anchor.textContent = result.text;
              } else {
                anchor.appendChild(selectedContent);
              }
              range.insertNode(anchor);
              range.setStartAfter(anchor);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              const anchor = document.createElement('a');
              anchor.href = result.url;
              anchor.textContent = result.text || selectedText;
              contentArea.appendChild(anchor);
            }
            handleInput();
          }
        } else {
          const anchor = document.createElement('a');
          anchor.href = result.url;
          anchor.textContent = result.text || result.url;
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(anchor);
            range.setStartAfter(anchor);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            contentArea.appendChild(anchor);
          }
          handleInput();
        }
      }
    }
  }

  // ─────────── Image handling ───────────
  async function handleInsertImage(): Promise<void> {
    const savedRange = saveSelection();

    const result = await showImageDialog('', '', locale);

    if (result) {
      contentArea.focus();
      restoreSelection(savedRange);

      saveToUndoStack();

      const img = document.createElement('img');
      img.src = result.url;
      img.alt = result.alt;

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (contentArea.contains(range.commonAncestorContainer)) {
          range.deleteContents();
          range.insertNode(img);
          range.setStartAfter(img);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          contentArea.appendChild(img);
        }
      } else {
        contentArea.appendChild(img);
      }

      handleInput();
    }
  }

  // ─────────── Toolbar action handler ───────────
  function handleToolbarAction(command: string, value?: string): void {
    if (isDisabled) return;

    // Block undo/redo from using execCommand — we handle them ourselves
    if (command === 'undo') {
      performUndo();
      return;
    }
    if (command === 'redo') {
      performRedo();
      return;
    }

    contentArea.focus();

    if (command === 'createLink') {
      handleCreateLink();
      return;
    }

    if (command === 'insertImage') {
      handleInsertImage();
      return;
    }

    saveToUndoStack();

    if (command === 'formatBlock' && value) {
      document.execCommand('formatBlock', false, value);
      return;
    }

    document.execCommand(command, false, value || '');
    saveToUndoStack();
    updateToolbarState();
    throttledHandleInput();
  }

  // ─────────── Custom Undo/Redo ───────────
  function performUndo(): void {
    if (undoStack.length === 0) return;
    const current = contentArea.innerHTML;
    const prev = undoStack.pop()!;
    redoStack.push(current);
    isUndoRedoAction = true;
    contentArea.innerHTML = prev;
    lastSavedContent = prev;
    isUndoRedoAction = false;
    handleInput();
    updateUndoRedoButtons();
  }

  function performRedo(): void {
    if (redoStack.length === 0) return;
    const current = contentArea.innerHTML;
    const next = redoStack.pop()!;
    undoStack.push(current);
    isUndoRedoAction = true;
    contentArea.innerHTML = next;
    lastSavedContent = next;
    isUndoRedoAction = false;
    handleInput();
    updateUndoRedoButtons();
  }

  // ─────────── Custom Buttons ───────────
  function registerCustomButtons(): void {
    if (!config.customButtons || config.customButtons.length === 0) return;

    config.customButtons.forEach((customBtn: CustomButton) => {
      const btn = document.createElement('button');
      btn.className = 're-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', customBtn.tooltip);
      btn.setAttribute('title', customBtn.tooltip);
      btn.dataset.command = 'custom';
      btn.dataset.customName = customBtn.name;

      if (customBtn.icon) {
        btn.innerHTML = customBtn.icon;
      } else {
        btn.textContent = customBtn.name;
      }

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isDisabled) return;
        customBtn.command(instance);
      });

      // Insert at specified position or append
      if (customBtn.position !== undefined && customBtn.position < toolbar.children.length) {
        toolbar.insertBefore(btn, toolbar.children[customBtn.position]);
      } else {
        toolbar.appendChild(btn);
      }
    });
  }

  // ─────────── Toolbar building ───────────
  function buildToolbar(): void {
    const toolbarItems = config.toolbar || defaultToolbar;

    toolbarItems.forEach((item) => {
      if (item.type === 'separator') {
        const sep = document.createElement('div');
        sep.className = 're-separator';
        sep.setAttribute('role', 'separator');
        sep.setAttribute('aria-orientation', 'vertical');
        toolbar.appendChild(sep);
        return;
      }

      if (item.type === 'button' && item.command) {
        const btn = document.createElement('button');
        btn.className = 're-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', item.tooltip || item.name || '');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', item.tooltip || '');
        btn.dataset.command = item.command;
        if (item.value) {
          btn.dataset.value = item.value;
        }

        const iconName = item.icon || item.name || '';
        if (icons[iconName]) {
          btn.innerHTML = icons[iconName];
        } else {
          btn.textContent = item.name || item.command;
        }

        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
        });
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          handleToolbarAction(item.command!, item.value);
        });

        toolbar.appendChild(btn);
      }
    });

    // Register custom buttons after default toolbar items
    registerCustomButtons();
  }

  // ─────────── Keyboard shortcuts ───────────
  function handleKeydown(e: KeyboardEvent): void {
    if (isDisabled) return;

    // Custom onKeyDown callback
    if (config.onKeyDown) {
      const result = config.onKeyDown(e);
      if (result === false) return;
    }

    // Keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          handleToolbarAction('bold');
          break;
        case 'i':
          e.preventDefault();
          handleToolbarAction('italic');
          break;
        case 'u':
          e.preventDefault();
          handleToolbarAction('underline');
          break;
        case 'z':
          e.preventDefault();
          performUndo();
          break;
        case 'y':
          e.preventDefault();
          performRedo();
          break;
      }
    }

    // Ctrl+Shift+Z for redo on Mac
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      performRedo();
    }

    // Tab key support for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      throttledHandleInput();
    }
  }

  // ─────────── Paste handling ───────────
  function handlePaste(e: ClipboardEvent): void {
    if (config.onPaste) {
      const result = config.onPaste(e);
      if (result === false) return;
    }

    // Save to undo stack before paste
    saveToUndoStack();

    // Let the default paste happen, then update
    setTimeout(() => {
      checkMaxLength();
      handleInput();
    }, 0);
  }

  // ─────────── Touch support for mobile ───────────
  let touchStartY = 0;
  function handleTouchStart(e: TouchEvent): void {
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e: TouchEvent): void {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = Math.abs(touchEndY - touchStartY);
    // Only prevent overscroll bounce for small movements (text selection)
    if (diff < 10) {
      updateToolbarState();
    }
  }

  // ─────────── Focus management ───────────
  let hasFocus = false;
  function handleFocus(): void {
    hasFocus = true;
    updateToolbarState();
    if (config.onFocus) {
      config.onFocus();
    }
  }

  function handleBlur(): void {
    hasFocus = false;
    updateToolbarState();
    if (config.onBlur) {
      config.onBlur();
    }
  }

  // ─────────── Input handling with MutationObserver ───────────
  // Backup: track DOM changes for reliability
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  function handleMutation(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!isUndoRedoAction) {
        updatePlaceholder();
        updateStatusBar();
        updateToolbarState();
      }
    }, 100);
  }

  const observer = new MutationObserver(handleMutation);

  // ─────────── Bind events ───────────
  contentArea.addEventListener('input', () => {
    if (!checkMaxLength()) return;
    saveToUndoStack();
    throttledHandleInput();
  });
  contentArea.addEventListener('keyup', updateToolbarState);
  contentArea.addEventListener('mouseup', updateToolbarState);
  contentArea.addEventListener('keydown', handleKeydown);
  contentArea.addEventListener('paste', handlePaste);
  contentArea.addEventListener('focus', handleFocus);
  contentArea.addEventListener('blur', handleBlur);

  // Touch events for mobile
  contentArea.addEventListener('touchstart', handleTouchStart, { passive: true });
  contentArea.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Observer for DOM changes
  observer.observe(contentArea, { childList: true, subtree: true, characterData: true });

  // ─────────── Initial setup ───────────
  if (config.content) {
    contentArea.innerHTML = config.content;
  }

  if (config.readOnly) {
    contentArea.setAttribute('contenteditable', 'false');
    wrapper.classList.add('re-readonly');
    isDisabled = true;
  }

  if (config.className) {
    currentClassName = config.className;
    wrapper.classList.add(...config.className.split(/\s+/).filter(Boolean));
  }

  if (config.toolbarVisible === false) {
    toolbar.style.display = 'none';
  }

  if (config.statusBarVisible === false) {
    statusBar.style.display = 'none';
  }

  // Build toolbar
  buildToolbar();

  // Initial state
  updatePlaceholder();
  updateStatusBar();
  initUndoStack();

  // Auto-focus
  if (config.autoFocus) {
    contentArea.focus();
  }

  // Fire onReady
  if (config.onReady) {
    config.onReady();
  }

  // ─────────── Public API ───────────
  const instance: RichEditorInstance = {
    getContent(): string {
      return contentArea.innerHTML;
    },

    setContent(html: string): void {
      saveToUndoStack();
      contentArea.innerHTML = html;
      lastSavedContent = contentArea.innerHTML;
      handleInput();
    },

    getText(): string {
      return contentArea.textContent || '';
    },

    execCommand(command: string, value?: string): void {
      handleToolbarAction(command, value);
    },

    queryCommandState(command: string): boolean {
      try {
        return document.queryCommandState(command);
      } catch {
        return false;
      }
    },

    destroy(): void {
      contentArea.removeEventListener('input', throttledHandleInput);
      contentArea.removeEventListener('keyup', updateToolbarState);
      contentArea.removeEventListener('mouseup', updateToolbarState);
      contentArea.removeEventListener('keydown', handleKeydown);
      contentArea.removeEventListener('paste', handlePaste);
      contentArea.removeEventListener('focus', handleFocus);
      contentArea.removeEventListener('blur', handleBlur);
      contentArea.removeEventListener('touchstart', handleTouchStart);
      contentArea.removeEventListener('touchend', handleTouchEnd);
      observer.disconnect();
      if (throttleTimer) clearTimeout(throttleTimer);
      if (debounceTimer) clearTimeout(debounceTimer);
      // Remove any open dialogs
      document.querySelectorAll('.re-dialog-overlay').forEach(el => el.remove());
      wrapper.remove();
    },

    getElement(): HTMLElement {
      return wrapper;
    },

    enable(): void {
      contentArea.setAttribute('contenteditable', 'true');
      wrapper.classList.remove('re-readonly');
      isDisabled = false;
      handleInput();
    },

    disable(): void {
      contentArea.setAttribute('contenteditable', 'false');
      wrapper.classList.add('re-readonly');
      isDisabled = true;
    },

    focus(): void {
      contentArea.focus();
    },

    isEmpty(): boolean {
      return contentArea.textContent?.trim() === '' &&
        contentArea.innerHTML.replace(/<br\s*\/?>/gi, '').trim() === '';
    },

    canUndo(): boolean {
      return undoStack.length > 0;
    },

    canRedo(): boolean {
      return redoStack.length > 0;
    },

    undo(): void {
      performUndo();
    },

    redo(): void {
      performRedo();
    },

    getCharacterCount(): number {
      return (contentArea.textContent || '').length;
    },

    getWordCount(): number {
      const text = (contentArea.textContent || '').trim();
      return text === '' ? 0 : text.split(/\s+/).length;
    },
  };

  return instance;
}