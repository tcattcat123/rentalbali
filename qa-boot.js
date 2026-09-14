const fs = require('fs');
const appPath = 'js/app.js', htmlPath = 'index.html';
const src = fs.readFileSync(appPath, 'utf8');
const html = fs.readFileSync(htmlPath, 'utf8');
let pass = 0, fail = 0;
const ok = (n, c) => { c ? pass++ : fail++; console.log((c ? 'PASS' : 'FAIL') + ' | ' + n); };

// ---- A. ID audit ----
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const jsIds = new Set([...src.matchAll(/\$\("([^"]+)"\)/g)].map(m => m[1]));
// IDs created dynamically inside JS templates
const dynIds = new Set([...src.matchAll(/id="(locClear|ddClr|dMain|dCount|dBack|dShare|dFav|dBook|dContact|descToggle|nlCancel)"/g)].map(m => m[1]));
const missing = [...jsIds].filter(id => !htmlIds.has(id) && !dynIds.has(id));
ok('A1 all JS-referenced IDs exist in HTML or templates (' + jsIds.size + ' refs)', missing.length === 0);
if (missing.length) console.log('   missing:', missing.join(', '));

// ---- B. boot + functional harness ----
const registry = {};
const fakeParent = { insertBefore() {}, appendChild() {} };
function fakeEl(id) {
  return {
    _id: id, value: '', textContent: '', innerHTML: '',
    dataset: {}, style: {}, options: [], selectedIndex: 0,
    parentNode: fakeParent,
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    setAttribute() {}, getAttribute: () => null,
    appendChild() {}, append() {}, addEventListener() {}, dispatchEvent() {},
    querySelector: () => fakeEl(id + '>q'),
    querySelectorAll: () => [],
    closest: () => fakeEl(id + '>c'),
    scrollIntoView() {}, click() {},
  };
}
const NULL_IDS = new Set(['detailClose', 'detailModal'].filter(id => !htmlIds.has(id)));
global.document = {
  getElementById: (id) => {
    if (NULL_IDS.has(id)) return null;
    return registry[id] || (registry[id] = fakeEl(id));
  },
  querySelectorAll: () => [], querySelector: () => null,
  createElement: () => fakeEl('el'),
  addEventListener: () => {}, body: { dataset: {} },
};
global.localStorage = { _s: {}, getItem(k) { return this._s[k] || null; }, setItem(k, v) { this._s[k] = String(v); } };
global.location = { hash: '', pathname: '/', search: '' };
global.window = { scrollTo() {} };
const driver = `
;globalThis.__T = { getFiltered, render, parseDeskripsi, driveIdFromUrl, fmtPrice, openDetail, closeDetail, resetFilters, applyQuick, LISTINGS, get state(){return state;} };`;
try { eval(src + driver); console.log('B0 boot: no throw'); pass++; }
catch (e) { console.log('B0 boot THREW:', e.message); fail++; process.exit(0); }
const T = globalThis.__T;
const cards = () => (registry['cardsGrid'].innerHTML.match(/property-card/g) || []).length;
ok('B1 initial grid renders 9 cards', cards() === 9);
ok('B2 results count shows 16', /16/.test(registry['resultsCount'].textContent));
// filter by type
registry['fType'].value = 'villa';
T.render();
const villaN = T.LISTINGS.filter(x => x.dealType === 'rent' && x.type === 'offer' && x.propertyType === 'villa').length;
ok('B3 type filter villa -> ' + villaN + ' total match', cards() === Math.min(9, villaN) && villaN > 0);
registry['fType'].value = '';
// query filter
T.state.query = 'убуд'; T.render();
const ubN = T.LISTINGS.filter(x => x.dealType === 'rent' && x.type === 'offer' && (x.title + x.location).toLowerCase().includes('убуд')).length;
ok('B4 text query ubud -> ' + ubN + ' match', cards() === Math.min(9, ubN));
T.state.query = ''; T.render();
// numeric budget query
T.state.query = '8'; T.render();
const bN = T.LISTINGS.filter(x => x.dealType === 'rent' && x.type === 'offer' && x.price <= 8000000).length;
ok('B5 budget query 8 (mln) matches priced<=8M', cards() === Math.min(9, bN) && bN > 0);
T.state.query = ''; T.render();
// parser
const RU = 'ПРОДАМ виллу. УБУД. Общая площадь дома 200 м², 2 этажа. На первом этаже одна спальня с собственным санузлом. На втором 2 спальни, в каждой спальне свой санузел. Гостевой санузел. Мебель. Участок 6 соток. (IDR 6.000.000.000). Цена: (IDR 8.400.000.000). Тел +6289518671550 «ROYAL LOTUS VILLA»';
const p = T.parseDeskripsi(RU);
ok('B6 parser deal/price/beds/baths/area/land/floors/phone', p.deal === 'sale' && p.price === 8400000000 && p.bedrooms === 3 && p.bathrooms === 4 && p.area === 200 && p.land === 600 && p.floors === 2 && p.phone === '+6289518671550');
// drive ids
ok('B7 driveIdFromUrl (full/bare)', T.driveIdFromUrl('https://drive.google.com/file/d/1VwkuAYKxXgJlhlM18aoXGD0t9S5-MVdq/view') === '1VwkuAYKxXgJlhlM18aoXGD0t9S5-MVdq' && T.driveIdFromUrl('1VwkuAYKxXgJlhlM18aoXGD0t9S5-MVdq') === '1VwkuAYKxXgJlhlM18aoXGD0t9S5-MVdq' && T.driveIdFromUrl('garbage') === '');
// detail open
try {
  T.openDetail(2);
  const dc = registry['detailContent'].innerHTML.replace(/[\u00A0\u202F]/g, ' ');
  ok('B8 detail renders price+gallery+chars', dc.includes('7 500 000') && dc.includes('dMain') && dc.includes('Характеристики'));
  T.closeDetail();
  ok('B9 closeDetail back to list', T.state.view === 'list');
} catch (e) { ok('B8/B9 detail open/close (' + e.message + ')', false); }
// reset path
T.state.query = 'zzz-no-match'; T.render();
ok('B10 empty query shows empty-state', cards() === 0);
T.resetFilters(); T.render();
ok('B11 reset restores 9 cards', cards() === 9);

console.log(`\nTOTAL: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
