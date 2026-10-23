// Mount the built client in JSDOM and report any runtime errors + rendered selects
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const dist = path.resolve('web/dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const scriptRe = /<script type="module"[^>]*src="([^"]+)"><\/script>/;
const src = html.match(scriptRe)?.[1];
if (!src) throw new Error('no module script tag in dist index.html');
const code = fs.readFileSync(path.join(dist, src), 'utf8');

// Strip the module script/stylesheet tags, then eval the bundle AFTER JSDOM has
// parsed the document. jsdom does not execute type="module", and eval-before-
// parse would fail silently: a <script> in <head> runs while #app is still
// null, and the production build strips Vue's mount-failure warning.
const plain = html.replace(scriptRe, '').replace(/<link rel="stylesheet"[^>]*>/, '');

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push('jsdomError: ' + (e.stack || e.message)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
vc.on('warn', (...a) => errors.push('console.warn: ' + a.join(' ')));

const dom = new JSDOM(plain, {
  url: 'http://localhost:3000/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.matchMedia = window.matchMedia || ((q) => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
    window.fetch = (input, init) => fetch(new URL(input, 'http://localhost:3000'), init);
    window.scrollTo = () => {};
    window.addEventListener('error', (e) => errors.push('window.error: ' + e.message));
    window.addEventListener('unhandledrejection', (e) => errors.push('unhandledrejection: ' + (e.reason?.stack || e.reason?.message)));
  },
});

await new Promise((r) => setTimeout(r, 0));
dom.window.eval(code);
await new Promise((r) => setTimeout(r, 2500)); // let /api/feeds resolve and options render

const doc = dom.window.document;
const app = doc.querySelector('#app');

console.log('runtime errors:', errors.length ? errors : 'none');
console.log('options total:', doc.querySelectorAll('select option').length);
console.log('selects on page:', doc.querySelectorAll('select').length);
console.log('first optgroup:', doc.querySelector('optgroup')?.label ?? 'none');
console.log('fieldset count:', doc.querySelectorAll('fieldset').length);
console.log('h1 text:', doc.querySelector('h1')?.textContent.trim());

const failures = [];
if (errors.length) failures.push('runtime errors');
if (!app || app.innerHTML.length === 0) failures.push('#app empty — client did not mount');
if (doc.querySelectorAll('select').length !== 3) failures.push('expected 3 selects (2 feed pickers + cut depth)');
if (doc.querySelectorAll('select option').length === 0) failures.push('no feed options rendered');
if (doc.querySelectorAll('fieldset').length < 2) failures.push('SourcePicker fieldsets missing');
if (!doc.querySelector('h1')?.textContent.includes('aleator')) failures.push('h1 missing');

process.exitCode = failures.length ? 1 : 0;
console.log(failures.length ? `FAIL: ${failures.join('; ')}` : 'OK: client mounts, both feed selectors render');
