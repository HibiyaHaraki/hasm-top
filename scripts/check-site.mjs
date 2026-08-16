// ###################################################
// File Name : check-site.mjs
// Purpose : Smoke-test the built HASM top-level site over HTTP.
// Description : Confirms the preview server returns the app shell and that
//               Vite emitted the expected module and stylesheet references.
// ###################################################

const siteUrl = process.argv[2] ?? 'http://127.0.0.1:4173/';

const response = await fetch(siteUrl);
if (!response.ok) {
  throw new Error(`Site returned HTTP ${response.status}: ${siteUrl}`);
}

const html = await response.text();
if (!html.includes('<div id="root"></div>')) {
  throw new Error('Site response does not contain the React root element.');
}
if (!html.includes('/assets/') || !html.includes('type="module"')) {
  throw new Error('Site response does not contain Vite asset references.');
}

console.log(`Site smoke test passed: ${siteUrl}`);