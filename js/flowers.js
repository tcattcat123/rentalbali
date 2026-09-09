/* Цветочная mini-app logic */
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); try{tg.setHeaderColor('#F7F5F0'); tg.setBackgroundColor('#F7F5F0');}catch(e){} }

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmt = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';

const state = {
  view: 'home',
  step: 1,
  mode: 'sub', // sub | once | date
  size: 'classic', price: 2490,
  freq: 'weekly', mult: 0.9, freqLabel: 'каждую неделю', perMonth: 4, billing: 'month',
  style: 'Нежный', day: 'Четверг', time: '9:00 – 13:00', who: 'Маме',
  promo: 0, paused: false,
};

const SIZE_RU = { mini:'Сильвер', classic:'Голд', grande:'Платинум' };
const FREQ_RU = { weekly:['каждую неделю',4], biweekly:['раз в 2 недели',2], monthly:['раз в месяц',1] };
const ICON_ARROW_R = '<svg class="ic-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
const ICON_BAG = '<svg class="ic-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
const ICON_HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z"/></svg>';

const PLANS = [
  { id:'mini', name:'Сильвер', desc:'9–11 стеблей · нежная забота для полки и настроения', price:1490, img:'img/tariffs/silver.png' },
  { id:'classic', name:'Голд', desc:'15–19 стеблей · хит для мамы и партнёра', price:2490, img:'img/tariffs/gold.png', hit:true },
  { id:'grande', name:'Платинум', desc:'25+ стеблей · вау-эффект к важной дате', price:3490, img:'img/tariffs/platinum.png' },
];
const REVIEWS = [
  { n:'Алина · маме', t:'Мама плакала. Говорит: «ты впервые не забыла». А я просто настроила один раз.', s:'Classic · каждую неделю' },
  { n:'Дамир · жене', t:'В 8 марта все стояли в очередях, а нам привезли домой утром. Та же цена, без стресса.', s:'Grande · к дате' },
  { n:'Ольга · бабушке', t:'Бабушка теперь ждёт четверг как праздник. Фото букета приходит мне заранее — спокойно.', s:'Сильвер · раз в 2 недели' },
  { n:'Марина · подруге', t:'Заказывала пионы подруге — привезли утром, открытку написали моим текстом.', s:'Голд · разово' },
  { n:'Игорь · маме', t:'Оформил маме год и забыл. Каждый месяц она присылает фото нового букета.', s:'Голд · на год' },
  { n:'София · себе', t:'Беру Сильвер себе домой. Пауза на отпуск — одной кнопкой.', s:'Сильвер · раз в 2 недели' },
  { n:'Тимур · жене', t:'Жена уверена, что я стал романтиком. Пусть так и думает.', s:'Платинум · каждую неделю' },
  { n:'Елена · бабушке', t:'Бабушка ждёт курьера как внуков. Спасибо, что помните за нас.', s:'Голд · раз в месяц' },
];
const FAQ = [
  ['Это точно не забудет про дату?','Нет. Дата хранится в подписке, мы привозим автоматически и напоминаем вам заранее. Пропуск — в один тап.'],
  ['Что будет в букете?','Сезонный авторский букет в выбранной палитре. Состав — сюрприз, фото присылаем перед выездом.'],
  ['А если в праздники всё подорожает?','У подписчиков цена фиксируется. Никаких наценок 8 марта и 14 февраля.'],
  ['Можно разово, без подписки?','Да. Режим «Разовый жест» — привезём за 2–4 часа по городу. Или настройте «К дате».'],
  ['Что если цветы завянут?','Заменим в течение 24 часов бесплатно, без вопросов и фото-допросов.'],
];

// ---------- toast + haptic ----------
function toast(msg){
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove('show'), 2200);
}
function haptic(type='light'){ try{ tg?.HapticFeedback?.notificationOccurred?.(type); }catch(e){} }

// ---------- базовая защита от копирования (правый клик, copy, devtools) ----------
(function(){
  const editable = el => el && /INPUT|TEXTAREA/.test(el.tagName);
  document.addEventListener('contextmenu', e=>{ if(!editable(e.target)) e.preventDefault(); });
  document.addEventListener('copy', e=>{ if(!editable(e.target)) e.preventDefault(); });
  document.addEventListener('cut', e=>{ if(!editable(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', e=>{ if(e.target.tagName==='IMG') e.preventDefault(); });
  document.addEventListener('keydown', e=>{
    const k = e.key.toLowerCase();
    if(e.key==='F12') e.preventDefault();
    if((e.ctrlKey||e.metaKey) && ['u','s','p'].includes(k)) e.preventDefault();
    if((e.ctrlKey||e.metaKey) && e.shiftKey && ['i','j','c','k'].includes(k)) e.preventDefault();
  });
})();

// ---------- navigation ----------
function go(view){
  state.view = view;
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#view-'+view).classList.add('active');
  $$('.tab').forEach(t=>t.classList.toggle('active', t.dataset.view===view));
  window.scrollTo({top:0, behavior:'smooth'});
  haptic('light');
  updateCta();
}
$$('.tab').forEach(t=>t.onclick=()=>go(t.dataset.view));
$('#logoBtn').onclick = ()=>go('home');
$$('[data-go]').forEach(b=>b.onclick=()=>{
  if(b.dataset.mode) setMode(b.dataset.mode);
  go(b.dataset.go);
});

// ---------- render static lists ----------
function renderPlans(){
  $('#plansList').innerHTML = PLANS.map(p=>`
    <div class="plan ${p.hit?'hit':''}">
      <div class="plan-top"><img src="${p.img}" alt="${p.name}" loading="lazy">
        <div><b>${p.name} · ${fmt(p.price)}</b><p>${p.desc}</p><span class="plan-price">подписка −10% · разово — база</span></div>
      </div>
      <div class="plan-foot"><button class="btn-dark" data-plan="${p.id}">${ICON_BAG}Выбрать ${p.name}</button></div>
    </div>`).join('');
  $$('[data-plan]').forEach(b=>b.onclick=()=>{
    const p = PLANS.find(x=>x.id===b.dataset.plan);
    selectSize(p.id, p.price); setMode('sub'); go('builder');
  });
}
function renderReviews(){
  $('#reviewsList').innerHTML = REVIEWS.map((r,i)=>`<div class="rev transition hover:-translate-y-1 hover:shadow-lg" style="transition-delay:${i*90}ms"><div class="rev-top"><img class="rev-ava" src="img/avatars/r${(i%8)+1}.jpg" alt="" loading="lazy"><b>${r.n}</b></div><p>«${r.t}»</p><div class="flex items-center justify-between"><span>${r.s}</span><button class="like-btn">${ICON_HEART}<em>${12+i*5}</em></button></div></div>`).join('');
}
function renderFaq(){
  $('#faqList').innerHTML = FAQ.map(f=>`<div class="faq-item"><button class="faq-q">${f[0]}<span>+</span></button><div class="faq-a">${f[1]}</div></div>`).join('');
  $$('.faq-q').forEach(q=>q.onclick=()=>q.parentElement.classList.toggle('open'));
}
const ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const SHOPCAT = { roses:'Розы', tulips:'Тюльпаны', peonies:'Пионы' };
const SHOP=[
  {id:'r1',cat:'roses',name:'Розовый рассвет',desc:'15 роз · нежный',price:2490,size:'classic',style:'Моно',img:'img/shop/p1.jpg',hit:true},
  {id:'r2',cat:'roses',name:'Красный бархат',desc:'25 роз · страстно',price:3490,size:'grande',style:'Моно',img:'img/shop/p2.jpg'},
  {id:'t1',cat:'tulips',name:'Весенний сад',desc:'15 тюльпанов',price:1990,size:'classic',style:'Нежный',img:'img/shop/p3.jpg',hit:true},
  {id:'t2',cat:'tulips',name:'Солнечные',desc:'9 тюльпанов · ярко',price:1490,size:'mini',style:'Яркий',img:'img/shop/p4.jpg'},
  {id:'p1',cat:'peonies',name:'Пионовое облако',desc:'11 пионов',price:2990,size:'classic',style:'Нежный',img:'img/shop/bouquet1.jpg',hit:true},
  {id:'p2',cat:'peonies',name:'Большой жест',desc:'21 пион · вау',price:3990,size:'grande',style:'Авторский',img:'img/shop/bouquet2.jpg'},
];
let shopCat='all';
function buyProduct(id){
  const p=SHOP.find(x=>x.id===id); if(!p) return;
  if(state.mode!=='sub') setMode('sub');
  state.size=p.size; state.price=p.price; state.style=p.style;
  $$('#sizeOpts .opt').forEach(o=>o.classList.toggle('sel',o.dataset.size===p.size));
  updateCta(); renderSummary(); haptic('light');
  toast(p.name+' — в подписку ♡');
  openSheet();
}
function renderShop(){
  const list=SHOP.filter(p=>shopCat==='all'||p.cat===shopCat);
  $('#shopGrid').innerHTML=list.map((p,i)=>`
    <div class="shop-card" style="animation-delay:${i*60}ms">
      <div class="shop-img" data-zoom="${p.id}"><img src="${p.img}" alt="${p.name}" loading="lazy">${p.hit?'<span class="shop-badge">хит</span>':''}<span class="shop-cat">${SHOPCAT[p.cat]}</span></div>
      <div class="shop-body"><b>${p.name}</b><span class="shop-meta">${p.desc} · ★ ${(4.7+(i%3)*0.1).toFixed(1)}</span>
        <div class="shop-buy"><em>${fmt(p.price)}</em><button class="shop-add" data-buy="${p.id}" aria-label="В подписку">${ICON_PLUS}</button></div>
      </div>
    </div>`).join('');
  $$('#shopGrid [data-buy]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); buyProduct(b.dataset.buy); });
  $$('#shopGrid [data-zoom]').forEach(z=>z.onclick=()=>openLb(z.dataset.zoom));
}
// лайтбокс: увеличение + листание
let lbList=[], lbIdx=0;
function renderLb(){
  const p=lbList[lbIdx]; if(!p) return;
  $('#lbImg').src=p.img; $('#lbImg').alt=p.name;
  $('#lbName').textContent=p.name;
  $('#lbDesc').textContent=SHOPCAT[p.cat]+' · '+p.desc+' · в подписке −10%';
  $('#lbPrice').textContent=fmt(p.price);
  $('#lbBuy').onclick=()=>{ $('#lightbox').classList.add('hidden'); buyProduct(p.id); };
}
function openLb(id){
  lbList=SHOP.filter(p=>shopCat==='all'||p.cat===shopCat);
  lbIdx=Math.max(0,lbList.findIndex(p=>p.id===id));
  renderLb(); $('#lightbox').classList.remove('hidden'); haptic('light');
}
function closeLb(){ $('#lightbox').classList.add('hidden'); }
function lbStep(d){ if(!lbList.length) return; lbIdx=(lbIdx+d+lbList.length)%lbList.length; renderLb(); haptic('light'); }
$$('#shopFilters .chip').forEach(c=>c.onclick=()=>{ $$('#shopFilters .chip').forEach(x=>x.classList.remove('sel')); c.classList.add('sel'); shopCat=c.dataset.cat; renderShop(); haptic('light'); });
function renderTimeline(){
  const items = [
    { d:'12', m:'фев', t:'Доставлено ♡', s:'Голд · мама сказала «спасибо»', st:['st-ok','получено'] },
    { d:'05', m:'фев', t:'В пути', s:'Голд · курьер рядом, фото отправлено', st:['st-way','в пути'] },
    { d:'29', m:'янв', t:'Запланировано', s:`${SIZE_RU[state.size]} · ${state.day}, ${state.time}`, st:['st-plan','план'] },
    { d:'22', m:'янв', t:'Запланировано', s:`${SIZE_RU[state.size]} · открытка приложена`, st:['st-plan','план'] },
  ];
  $('#timelineList').innerHTML = items.map(i=>`<div class="tl"><div class="tl-date"><b>${i.d}</b><span>${i.m}</span></div><div><b>${i.t}</b><p>${i.s}</p></div><span class="tl-status ${i.st[0]}">${i.st[1]}</span></div>`).join('');
}

// ---------- builder ----------
function setStep(n){
  state.step = Math.min(4, Math.max(1, n));
  $$('.bstep').forEach(s=>s.classList.toggle('active', +s.dataset.step===state.step));
  $('#builderStepLabel').textContent = `шаг ${state.step}/4`;
  $('#progressBar').style.width = (state.step*25)+'%';
  $('#backBtn').style.visibility = state.step===1 ? 'hidden' : 'visible';
  $('#nextBtn').innerHTML = state.step===4 ? 'К оформлению' + ICON_ARROW_R : 'Далее' + ICON_ARROW_R;
  updateCta();
}
$('#backBtn').onclick = ()=>setStep(state.step-1);
$('#nextBtn').onclick = ()=>{
  if(state.step<4){ setStep(state.step+1); haptic('light'); }
  else openSheet();
};

function selectSize(id, price){ state.size=id; state.price=price;
  $$('#sizeOpts .opt').forEach(o=>o.classList.toggle('sel', o.dataset.size===id)); updateCta(); renderSummary(); }
$$('#sizeOpts .opt').forEach(o=>o.onclick=()=>{ selectSize(o.dataset.size, +o.dataset.price); haptic('light'); });

$$('#freqOpts .opt').forEach(o=>o.onclick=()=>{
  $$('#freqOpts .opt').forEach(x=>x.classList.remove('sel')); o.classList.add('sel');
  state.freq=o.dataset.freq; state.mult=+o.dataset.mult;
  state.freqLabel=FREQ_RU[state.freq][0]; state.perMonth=FREQ_RU[state.freq][1];
  updateCta(); renderSummary(); haptic('light');
});

function chipGroup(sel, key){
  $$(sel+' .chip').forEach(c=>c.onclick=()=>{
    $$(sel+' .chip').forEach(x=>x.classList.remove('sel')); c.classList.add('sel');
    state[key]=c.dataset[Object.keys(c.dataset)[0]]; updateCta(); renderSummary(); haptic('light');
  });
}
chipGroup('#styleChips','style'); chipGroup('#dayChips','day'); chipGroup('#timeChips','time'); chipGroup('#whoChips','who'); chipGroup('#billChips','billing');

$$('#scenarioRow .sc').forEach(b=>b.onclick=()=>{
  $$('#scenarioRow .sc').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
  state.who=b.dataset.sc;
  $$('#whoChips .chip').forEach(c=>c.classList.toggle('sel', c.dataset.who===state.who || (state.who==='К дате'&&c.dataset.who==='Маме')));
  const texts={'Маме':'Мам, ты — моё тепло. Люблю ♡','Партнёру':'Просто так. Ты — моё любимое ♡','Бабушке':'Спасибо за тепло. Обнимаю ♡','К дате':'С важным днём! Ты достоин лучшего ♡'};
  $('#cardInput').value = texts[state.who] || texts['Маме'];
  toast(state.who==='К дате' ? 'Режим «К дате» — настройте дату ниже' : `Забота: ${state.who.toLowerCase()} ♡`);
  if(state.who==='К дате') setMode('date');
});

function setMode(m){
  state.mode=m;
  $$('#modeSwitch .chip').forEach(c=>c.classList.toggle('sel', c.dataset.mode===m));
  $$('.modes .mode').forEach(x=>x.classList.toggle('sel', x.dataset.mode===m));
  const once = (m!=='sub');
  $('#onceBox').classList.toggle('hidden', !once);
  $('#billBox').classList.toggle('hidden', once);
  $('#freqTitle').textContent = m==='sub' ? 'Как часто заботиться?' : 'Когда позаботиться?';
  $('#freqOpts').style.display = m==='sub' ? '' : 'none';
  $('#builderTitle').textContent = m==='sub' ? 'Конструктор заботы' : m==='once' ? 'Быстрый жест' : 'Забота к дате';
  if(m!=='sub'){ state.perMonth=1; state.mult=1; }
  else { state.perMonth=FREQ_RU[state.freq][1]; state.mult = state.freq==='weekly'?0.9:state.freq==='biweekly'?0.95:1; }
  updateCta(); renderSummary();
}
$$('#modeSwitch .chip').forEach(c=>c.onclick=()=>setMode(c.dataset.mode));
$$('.modes .mode').forEach(x=>x.onclick=()=>{ setMode(x.dataset.mode); go('builder'); });

// ---------- price ----------
function bouquetPrice(){ return Math.round(state.price * state.mult * (1-state.promo)); }
function monthTotal(){ return state.mode==='sub' ? bouquetPrice()*state.perMonth : bouquetPrice(); }
function yearlyTotal(){ return Math.round(monthTotal()*12*0.8); }
function isYearly(){ return state.mode==='sub' && state.billing==='year'; }
function updateCta(){
  const p = bouquetPrice();
  const desc = state.mode==='sub' ? `${SIZE_RU[state.size]} · ${state.freqLabel}` : state.mode==='once' ? `${SIZE_RU[state.size]} · разовый жест` : `${SIZE_RU[state.size]} · к дате`;
  $('#ctaPrice').textContent = fmt(p) + (state.mode==='sub' ? ' / букет' : '');
  $('#ctaDesc').textContent = desc;
  $('#myPlan').textContent = desc;
  $('#myPrice').textContent = fmt(p) + ' / букет';
  $('#ctaBtn').innerHTML = 'Передать тепло' + ICON_BAG;
  renderSummary();
}
function renderSummary(){
  const p = bouquetPrice(), y = isYearly();
  $('#summaryCard').innerHTML = `
    <div class="srow"><span>${state.who} · ${SIZE_RU[state.size]} · ${state.style}</span><span>${fmt(state.price)}</span></div>
    <div class="srow"><span>${state.mode==='sub'?'Подписка '+state.freqLabel:'Разово'}${state.promo?` · −${Math.round(state.promo*100)}%`:''}</span><span>−${fmt(state.price-p)}</span></div>
    <div class="srow"><span>${state.day} · ${state.time}</span><span>доставка 0 ₽</span></div>
    ${y?`<div class="srow"><span>12 месяцев · один платёж</span><span>−20%</span></div>`:''}
    <div class="srow total"><span>Итого${y?' / год':state.mode==='sub'?' / месяц':''}</span><span>${fmt(y?yearlyTotal():monthTotal())}</span></div>`;
}

// ---------- sheet / checkout ----------
function openSheet(){
  const p = bouquetPrice();
  $('#cartBody').innerHTML = `
    <div class="cart-row"><span>✿ ${state.who} · ${SIZE_RU[state.size]} · ${state.style}<br><small style="color:var(--mut)">${state.mode==='sub'?state.freqLabel+' · '+state.perMonth+' букета/мес':state.mode==='once'?'разовый жест':'к дате'} · ${state.day}, ${state.time}</small></span><b>${fmt(p)}</b></div>
    <div class="cart-row"><span>Доставка · открытка</span><b>0 ₽</b></div>
    ${state.promo?`<div class="cart-row"><span>Промокод CVETI15</span><b>−15%</b></div>`:''}`;
  $('#cartTotalLabel').textContent = isYearly() ? 'Итого за год · −20%' : 'Итого за месяц';
  $('#cartTotal').textContent = fmt(isYearly()?yearlyTotal():monthTotal());
  $('#sheetBg').classList.add('show'); $('#cartSheet').classList.add('show');
  if(tg?.MainButton){ tg.MainButton.setText(`Оформить · ${fmt(monthTotal())}`); tg.MainButton.show(); tg.MainButton.onClick(doCheckout); }
}
function closeSheet(){ $('#sheetBg').classList.remove('show'); $('#cartSheet').classList.remove('show'); tg?.MainButton?.hide(); }
$('#cartBtn').onclick = ()=>go('shop');
$('#ctaBtn').onclick = ()=>{ go('builder'); setStep(4); openSheet(); };
$('#closeSheet').onclick = closeSheet;
$('#sheetBack').onclick = ()=>{ closeSheet(); haptic('light'); };
$('#sheetBg').onclick = closeSheet;

$('#promoBtn').onclick = ()=>{
  const v = $('#promoInput').value.trim().toUpperCase();
  if(v==='CVETI15'){ state.promo=0.15; toast('Промокод применён: −15% ♡'); }
  else { state.promo=0; toast('Такого промокода нет'); }
  updateCta(); openSheet();
};

function doCheckout(){
  const name = $('#fName').value.trim(), addr = $('#fAddress').value.trim();
  if(state.mode==='sub' && (!name || !addr)){ toast('Подскажите имя и адрес близкого'); setStep(4); closeSheet(); go('builder'); return; }
  closeSheet();
  $('#successText').textContent = state.mode==='sub'
    ? `Первый букет (${SIZE_RU[state.size]}) приедет: ${state.day}, ${state.time}.${isYearly()?' Год оплачен — 12 месяцев без забот.':''} Фото пришлём заранее.`
    : `Букет ${SIZE_RU[state.size]} для: ${state.who}. Привезём бережно и вовремя ♡`;
  try{ tg?.sendData?.(JSON.stringify({mode:state.mode, billing:state.billing, size:state.size, total:isYearly()?yearlyTotal():monthTotal(), who:state.who})); }catch(e){}
  $('#cartCount').textContent = state.mode==='sub' ? state.perMonth : 1;
  haptic('success');
}
$('#lbClose').onclick = closeLb;
$('#lbBg').onclick = closeLb;
$('#lbPrev').onclick = e=>{ e.stopPropagation(); lbStep(-1); };
$('#lbNext').onclick = e=>{ e.stopPropagation(); lbStep(1); };
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeLb(); });
$('#checkoutBtn').onclick = doCheckout;
$('#successOk').onclick = ()=>{ $('#successView').classList.add('hidden'); renderTimeline(); go('delivery'); };

// ---------- misc ----------
$('#skipBtn').onclick = ()=>toast('Четверг пропущен. Деньги не спишутся ♡');
function togglePause(){ state.paused=!state.paused; toast(state.paused?'Забота на паузе ⏸':'Забота снова активна ●'); }
$('#pauseBtn2').onclick = togglePause;
$('#dateAdd').onclick = ()=>{
  const v = $('#dateInput').value.trim(); if(!v) return;
  const d = document.createElement('div'); d.className='date-row';
  d.innerHTML=`<div><b>${v}</b><span class="muted">напомним за 3 дня · привезём сами</span></div><span class="date-badge">помню ✓</span>`;
  $('#datesList').appendChild(d); $('#dateInput').value=''; toast('Запомнили. Не забудем ✓');
};
[['#addrBtn','Адреса близких скоро появятся здесь'],['#payBtn','Оплата: карта ···· 4021'],['#giftBtn','Подарить заботу: выберите тариф выше ☆'],['#helpBtn','Поддержка: напишите нам, ответим за 5 минут']].forEach(([s,m])=>{ $(s).onclick=()=>toast(m); });

// ---------- настроение (темы) ----------
const SKINS = { classic:'Зелёная классика 🌿', noir:'Чёрно-розовая 💖', vanilla:'Тёплая ваниль 🍰' };
function applySkin(name){
  state.skin = SKINS[name] ? name : 'classic';
  if(state.skin==='classic') document.body.removeAttribute('data-skin');
  else document.body.setAttribute('data-skin', state.skin);
  $$('#skinsRow .skin').forEach(b=>b.classList.toggle('sel', b.dataset.skin===state.skin));
  try{ localStorage.setItem('cveti_skin', state.skin); }catch(e){}
}
$$('#skinsRow .skin').forEach(b=>b.onclick=()=>{ applySkin(b.dataset.skin); toast(SKINS[state.skin]); haptic('light'); });

// init
(function init(){
  const d = new Date(); d.setDate(d.getDate()+3);
  const iso = d.toISOString().slice(0,10);
  const od = $('#onceDate'); if(od) od.value = iso;
  renderPlans(); renderReviews(); renderFaq(); renderShop(); renderTimeline(); setStep(1); updateCta();
  try{ applySkin(localStorage.getItem('cveti_skin')||'classic'); }catch(e){ applySkin('classic'); }
  initFestive(); initReveal(); initTilt(); initSlider();
})();

// ---------- hero slider: картинки меняются сами (не встаёт на мобиле) ----------
function initSlider(){
  const box = $('#heroImg'); if(!box) return;
  const slides = [...box.querySelectorAll('.slide')];
  if(slides.length<2) return;
  const dotsBox = $('#heroDots');
  let cur = 0;
  function show(i){
    cur = (i+slides.length)%slides.length;
    slides.forEach((s,k)=>s.classList.toggle('active', k===cur));
    if(dotsBox) [...dotsBox.children].forEach((d,k)=>d.classList.toggle('on', k===cur));
  }
  if(dotsBox){
    dotsBox.innerHTML = slides.map((_,i)=>`<button aria-label="слайд ${i+1}" class="${i===0?'on':''}"></button>`).join('');
    [...dotsBox.children].forEach((d,i)=>d.onclick=()=>{ show(i); haptic('light'); });
  }
  show(0);
  setInterval(()=>{ if(!document.hidden) show(cur+1); },3000);
  // свайп пальцем (автопроигрывание не останавливается)
  let x0 = null;
  box.style.touchAction = 'pan-y';
  box.addEventListener('touchstart', e=>{ x0 = e.touches[0].clientX; }, {passive:true});
  box.addEventListener('touchend', e=>{
    if(x0===null) return;
    const dx = e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>30) show(cur+(dx<0?1:-1));
    x0 = null;
  }, {passive:true});
}

// ---------- festive interactive layer ----------
function initFestive(){
  // likes on reviews (delegated)
  document.addEventListener('click', e=>{
    const b = e.target.closest('.like-btn');
    if(!b) return;
    b.classList.toggle('liked');
    const n = b.querySelector('em');
    let v = parseInt(n.textContent)||0;
    n.textContent = b.classList.contains('liked') ? v+1 : v-1;
    haptic('light');
  });
}
function initReveal(){
  const io = new IntersectionObserver(es=>es.forEach(x=>{ if(x.isIntersecting){ x.target.classList.add('vis'); io.unobserve(x.target);} }),{threshold:.12});
  const apply = ()=>{
    $$('.utp-card,.plan,.step,.banner,.faq-item,.sub-card,.tl').forEach(el=>{ if(!el.classList.contains('reveal')){ el.classList.add('reveal'); io.observe(el);} });
  };
  apply();
  // reviews pop bottom-up on scroll, one by one
  const rio = new IntersectionObserver(es=>es.forEach(x=>{ if(x.isIntersecting){ x.target.classList.add('vis'); rio.unobserve(x.target); } }),{threshold:.2});
  $$('.rev').forEach(el=>rio.observe(el));
  // re-apply after dynamic renders
  const origRender = renderTimeline;
  setTimeout(apply, 500);
}
function initTilt(){
  const el = $('#heroImg'); if(!el) return;
  el.addEventListener('pointermove', e=>{
    const r = el.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    el.style.transform = `perspective(700px) rotateY(${x*8}deg) rotateX(${-y*8}deg)`;
  });
  el.addEventListener('pointerleave', ()=>{ el.style.transform=''; });
}
// confetti on checkout (lightweight canvas)
function boom(){
  const c = $('#confetti'); if(!c) return;
  const ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const P = Array.from({length:90},()=>({x:innerWidth/2+(Math.random()-.5)*120,y:innerHeight*.4,vx:(Math.random()-.5)*7,vy:-Math.random()*7-2,g:.28,s:4+Math.random()*5,c:['#2E7D4F','#8FD694','#F3B4B4','#F6E9D8','#fff'][Math.floor(Math.random()*5)],r:Math.random()*Math.PI,vr:(Math.random()-.5)*.3,l:90+Math.random()*40}));
  let f=0;
  (function tick(){
    ctx.clearRect(0,0,c.width,c.height); f++;
    P.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.r+=p.vr; p.l--;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle=p.c; ctx.fillRect(0,0,p.s,p.s*.6); ctx.restore(); });
    if(f<140) requestAnimationFrame(tick); else ctx.clearRect(0,0,c.width,c.height);
  })();
}
const _doCheckout = doCheckout;
doCheckout = function(){ _doCheckout(); boom(); };
