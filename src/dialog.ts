/**
 * Custom dialog components for the SRich Editor
 */

export interface LinkDialogResult {
  action: 'insert' | 'remove';
  text: string;
  url: string;
}

export interface ImageDialogResult {
  url: string;
  alt: string;
}

/** Default locale strings for dialogs */
const defaultDialogLocale = {
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

type DialogLocale = typeof defaultDialogLocale;

/**
 * Show a custom link dialog
 * @param currentText - The currently selected text (if any)
 * @param currentUrl - The current URL (if editing an existing link)
 * @param locale - Optional locale strings
 * @returns Promise that resolves with the user's input or null if cancelled
 */
export function showLinkDialog(
  currentText: string = '',
  currentUrl: string = '',
  locale?: Partial<DialogLocale>,
): Promise<LinkDialogResult | null> {
  const loc = { ...defaultDialogLocale, ...locale };

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 're-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 're-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', currentUrl ? loc.editLink : loc.insertLink);

    // Header
    const header = document.createElement('div');
    header.className = 're-dialog-header';
    const title = document.createElement('span');
    title.className = 're-dialog-title';
    title.textContent = currentUrl ? loc.editLink : loc.insertLink;
    const closeBtn = document.createElement('button');
    closeBtn.className = 're-dialog-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', loc.close);
    closeBtn.innerHTML = '\u00d7';
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 're-dialog-body';

    // Text field
    const textField = document.createElement('div');
    textField.className = 're-dialog-field';
    const textLabel = document.createElement('label');
    textLabel.className = 're-dialog-label';
    textLabel.setAttribute('for', 're-link-text');
    textLabel.textContent = loc.displayText;
    const textInput = document.createElement('input');
    textInput.className = 're-dialog-input';
    textInput.type = 'text';
    textInput.id = 're-link-text';
    textInput.placeholder = 'Text to display';
    textInput.value = currentText;
    textField.appendChild(textLabel);
    textField.appendChild(textInput);

    // URL field
    const urlField = document.createElement('div');
    urlField.className = 're-dialog-field';
    const urlLabel = document.createElement('label');
    urlLabel.className = 're-dialog-label';
    urlLabel.setAttribute('for', 're-link-url');
    urlLabel.textContent = loc.url;
    const urlInput = document.createElement('input');
    urlInput.className = 're-dialog-input';
    urlInput.type = 'url';
    urlInput.id = 're-link-url';
    urlInput.placeholder = 'https://example.com';
    urlInput.value = currentUrl;
    urlField.appendChild(urlLabel);
    urlField.appendChild(urlInput);

    body.appendChild(textField);
    body.appendChild(urlField);

    // Footer
    const footer = document.createElement('div');
    footer.className = 're-dialog-footer';

    // "Remove Link" button when editing an existing link
    if (currentUrl) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 're-dialog-btn re-dialog-btn-remove';
      removeBtn.type = 'button';
      removeBtn.textContent = loc.removeLink;
      removeBtn.addEventListener('click', () => {
        cleanup();
        resolve({ action: 'remove', text: '', url: '' });
      });
      footer.appendChild(removeBtn);
    }

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 're-dialog-btn re-dialog-btn-cancel';
    cancelBtn.type = 'button';
    cancelBtn.textContent = loc.cancel;
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 're-dialog-btn re-dialog-btn-confirm';
    confirmBtn.type = 'button';
    confirmBtn.textContent = currentUrl ? loc.save : loc.insert;
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => {
      if (currentUrl) {
        urlInput.focus();
        urlInput.select();
      } else {
        textInput.focus();
      }
    }, 50);

    function cleanup() {
      overlay.remove();
    }

    function confirm() {
      const text = textInput.value.trim();
      const url = urlInput.value.trim();
      if (url) {
        resolve({ action: 'insert', text: text || url, url });
      } else {
        urlInput.focus();
        urlInput.classList.add('re-dialog-input-error');
        setTimeout(() => urlInput.classList.remove('re-dialog-input-error'), 1500);
        return;
      }
      cleanup();
    }

    function cancel() {
      resolve(null);
      cleanup();
    }

    closeBtn.addEventListener('click', cancel);
    cancelBtn.addEventListener('click', cancel);
    confirmBtn.addEventListener('click', confirm);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cancel();
      }
    });

    // Focus trap for accessibility
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      } else if (e.key === 'Enter' && document.activeElement === urlInput) {
        e.preventDefault();
        confirm();
      } else if (e.key === 'Tab') {
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'input, button, [tabindex]:not([tabindex="-1"])',
        );
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });
  });
}

/**
 * Show a custom image dialog
 * @param currentUrl - The current image URL (if editing)
 * @param currentAlt - The current alt text (if editing)
 * @param locale - Optional locale strings
 * @returns Promise that resolves with the user's input or null if cancelled
 */
export function showImageDialog(
  currentUrl: string = '',
  currentAlt: string = '',
  locale?: Partial<DialogLocale>,
): Promise<ImageDialogResult | null> {
  const loc = { ...defaultDialogLocale, ...locale };

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 're-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 're-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', currentUrl ? loc.editImage : loc.insertImage);

    // Header
    const header = document.createElement('div');
    header.className = 're-dialog-header';
    const title = document.createElement('span');
    title.className = 're-dialog-title';
    title.textContent = currentUrl ? loc.editImage : loc.insertImage;
    const closeBtn = document.createElement('button');
    closeBtn.className = 're-dialog-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', loc.close);
    closeBtn.innerHTML = '\u00d7';
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 're-dialog-body';

    // URL field
    const urlField = document.createElement('div');
    urlField.className = 're-dialog-field';
    const urlLabel = document.createElement('label');
    urlLabel.className = 're-dialog-label';
    urlLabel.setAttribute('for', 're-image-url');
    urlLabel.textContent = loc.imageUrl;
    const urlInput = document.createElement('input');
    urlInput.className = 're-dialog-input';
    urlInput.type = 'url';
    urlInput.id = 're-image-url';
    urlInput.placeholder = 'https://example.com/image.jpg';
    urlInput.value = currentUrl;
    urlField.appendChild(urlLabel);
    urlField.appendChild(urlInput);

    // Alt text field
    const altField = document.createElement('div');
    altField.className = 're-dialog-field';
    const altLabel = document.createElement('label');
    altLabel.className = 're-dialog-label';
    altLabel.setAttribute('for', 're-image-alt');
    altLabel.textContent = loc.altText;
    const altInput = document.createElement('input');
    altInput.className = 're-dialog-input';
    altInput.type = 'text';
    altInput.id = 're-image-alt';
    altInput.placeholder = 'Description of the image';
    altInput.value = currentAlt;
    altField.appendChild(altLabel);
    altField.appendChild(altInput);

    // Preview area
    const previewField = document.createElement('div');
    previewField.className = 're-dialog-field';
    const previewLabel = document.createElement('span');
    previewLabel.className = 're-dialog-label';
    previewLabel.textContent = loc.preview;
    const previewContainer = document.createElement('div');
    previewContainer.className = 're-dialog-image-preview';

    function updatePreview() {
      const url = urlInput.value.trim();
      previewContainer.innerHTML = '';
      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = altInput.value;
        img.onerror = () => {
          previewContainer.innerHTML = `<span class="re-dialog-image-error">${loc.unableToLoadImage}</span>`;
        };
        previewContainer.appendChild(img);
      }
    }

    urlInput.addEventListener('input', updatePreview);

    previewField.appendChild(previewLabel);
    previewField.appendChild(previewContainer);

    body.appendChild(urlField);
    body.appendChild(altField);
    body.appendChild(previewField);

    // Footer
    const footer = document.createElement('div');
    footer.className = 're-dialog-footer';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 're-dialog-btn re-dialog-btn-cancel';
    cancelBtn.type = 'button';
    cancelBtn.textContent = loc.cancel;
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 're-dialog-btn re-dialog-btn-confirm';
    confirmBtn.type = 'button';
    confirmBtn.textContent = currentUrl ? loc.save : loc.insert;
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => {
      urlInput.focus();
      urlInput.select();
    }, 50);

    function cleanup() {
      overlay.remove();
    }

    function confirm() {
      const url = urlInput.value.trim();
      const alt = altInput.value.trim();
      if (url) {
        resolve({ url, alt });
      } else {
        urlInput.focus();
        urlInput.classList.add('re-dialog-input-error');
        setTimeout(() => urlInput.classList.remove('re-dialog-input-error'), 1500);
        return;
      }
      cleanup();
    }

    function cancel() {
      resolve(null);
      cleanup();
    }

    closeBtn.addEventListener('click', cancel);
    cancelBtn.addEventListener('click', cancel);
    confirmBtn.addEventListener('click', confirm);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cancel();
      }
    });

    // Focus trap for accessibility
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      } else if (e.key === 'Enter' && document.activeElement === urlInput) {
        e.preventDefault();
        confirm();
      } else if (e.key === 'Tab') {
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'input, button, [tabindex]:not([tabindex="-1"])',
        );
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });
  });
}