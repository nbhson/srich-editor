const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3847;
const ROOT = path.resolve(__dirname, '..');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

(async () => {
  // Start local server
  const server = http.createServer((req, res) => {
    let filePath = path.join(ROOT, req.url === '/' ? '/e2e/test-page.html' : req.url);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server running on port ${PORT}`);

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(`http://localhost:${PORT}/demo/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Populate editor with rich content using setContent
  const richContent = `
<h1>Welcome to SRich Editor</h1>
<p>A <strong>lightweight</strong>, <em>dependency-free</em> rich text editor built for modern web applications. It provides a clean API and powerful features without any external dependencies.</p>

<h2>Key Features</h2>
<ul>
  <li><strong>Zero Dependencies</strong> — No jQuery, React, or any framework required</li>
  <li><em>Clean API</em> — Simple and intuitive method calls</li>
  <li><u>Full Toolbar</u> — Bold, italic, underline, headings, lists, links, and more</li>
  <li><strong>Comments System</strong> — Add inline comments and replies</li>
  <li><em>Export to PDF & Word</em> — One-click document export</li>
</ul>

<h2>Getting Started</h2>
<p>Install the package via npm:</p>
<pre><code>npm install srich-editor</code></pre>
<p>Then initialize the editor with a few lines of code:</p>
<pre><code>import { createEditor } from 'srich-editor';
import 'srich-editor/dist/styles.css';

const editor = createEditor({
  container: '#editor',
  placeholder: 'Start typing...',
  onChange: (content) => console.log(content),
});</code></pre>

<h2>Advanced Usage</h2>
<p>The editor supports a wide range of formatting options. You can create <a href="https://github.com">beautiful documents</a> with ease. Here are some examples:</p>

<blockquote>
  <p>"SRich Editor has completely transformed how we handle content editing in our application. It's fast, reliable, and incredibly easy to integrate." — <strong>Lead Developer</strong></p>
</blockquote>

<h3>Ordered List of Capabilities</h3>
<ol>
  <li>Text formatting: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s></li>
  <li>Headings from H1 to H6</li>
  <li>Unordered and ordered lists</li>
  <li><a href="https://example.com">Hyperlinks</a> with customizable display text</li>
  <li>Image insertion with alt text support</li>
  <li>Undo/Redo functionality</li>
  <li>Word and character count</li>
  <li>RTL language support</li>
</ol>

<h3>Inline Code Example</h3>
<p>Use the <code>createEditor()</code> function to initialize. The <code>options</code> object accepts properties like <code>container</code>, <code>placeholder</code>, <code>height</code>, and <code>onChange</code> callbacks.</p>

<h2>Comparison Table</h2>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background: #f3f4f6;">
      <th>Feature</th>
      <th>SRich Editor</th>
      <th>Other Editors</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bundle Size</td>
      <td><strong>~15KB gzipped</strong></td>
      <td>200KB+</td>
    </tr>
    <tr>
      <td>Dependencies</td>
      <td><strong>None</strong></td>
      <td>Multiple</td>
    </tr>
    <tr>
      <td>Comments</td>
      <td><strong>Built-in</strong></td>
      <td>Plugin required</td>
    </tr>
    <tr>
      <td>Export PDF/Word</td>
      <td><strong>Built-in</strong></td>
      <td>Not available</td>
    </tr>
  </tbody>
</table>

<p style="margin-top: 20px; color: #6b7280; font-size: 14px;">Last updated: July 2026 · Made with ♥ by the SRich team</p>
`;

  // Set content using the editor's API
  await page.evaluate((html) => {
    // The editor instance is stored in the 'editor' variable from the demo page
    window.editor.setContent(html);
  }, richContent);

  await page.waitForTimeout(500);

  // Take screenshot of just the editor area
  const editorEl = await page.$('.re-wrapper');
  if (editorEl) {
    await editorEl.screenshot({ path: 'demo/screenshot.png' });
    console.log('Screenshot saved to demo/screenshot.png');
  } else {
    // Fallback: take full page screenshot
    await page.screenshot({ path: 'demo/screenshot.png', fullPage: true });
    console.log('Full page screenshot saved to demo/screenshot.png');
  }

  await browser.close();
  server.close();
})();
