/* Bloom mini-app logic */
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
  freq: 'weekly', mult: 0.9, freqLabel: 'каждую неделю', perMonth: 4,
  style: 'Нежный', day: 'Четверг', time: '9:00 – 13:00', who: 'Маме',
  promo: 0, paused: false,
};

const SIZE_RU = { mini:'Mini', classic:'Classic', grande:'Grande' };
const FREQ_RU = { weekly:['каждую неделю',4], biweekly:['раз в 2 недели',2], monthly:['раз в месяц',1] };

const PLANS = [
  { id:'mini', name:'Mini', desc:'9–11 стеблей · нежная забота для полки и настроения', price:1490, img:'https://images.unsplash.com/photo-1520763185298-1b434c919102?q=80&w=400&auto=format&fit=crop' },
  { id:'classic', name:'Classic', desc:'15–19 стеблей · хит для мамы и партнёра', price:2490, img:'https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=400&auto=format&fit=crop', hit:true },
  { id:'grande', name:'Grande', desc:'25+ стеблей · вау-эффект к важной дате', price:3490, img:'https://images.unsplash.com/photo-1523694576729-dc99e9c0b191?q=80&w=400&auto=format&fit=crop' },
];
const REVIEWS = [
  { n:'Алина · маме', t:'Мама плакала. Говорит: «ты впервые не забыла». А я просто настроила один раз.', s:'Classic · каждую неделю' },
  { n:'Дамир · жене', t:'В 8 марта все стояли в очередях, а нам привезли домой утром. Та же цена, без стресса.', s:'Grande · к дате' },
  { n:'Ольга · бабушке', t:'Бабушка теперь ждёт четверг как праздник. Фото букета приходит мне заранее — спокойно.', s:'Mini · раз в 2 недели' },
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
      <div class="plan-foot"><button class="btn-dark" data-plan="${p.id}">Выбрать ${p.name}</button></div>
    </div>`).join('');
  $$('[data-plan]').forEach(b=>b.onclick=()=>{
    const p = PLANS.find(x=>x.id===b.dataset.plan);
    selectSize(p.id, p.price); setMode('sub'); go('builder');
  });
}
function renderReviews(){
  $('#reviewsList').innerHTML = REVIEWS.map(r=>`<div class="rev"><b>${r.n}</b><p>«${r.t}»</p><span>${r.s}</span></div>`).join('');
}
function renderFaq(){
  $('#faqList').innerHTML = FAQ.map(f=>`<div class="faq-item"><button class="faq-q">${f[0]}<span>+</span></button><div class="faq-a">${f[1]}</div></div>`).join('');
  $$('.faq-q').forEach(q=>q.onclick=()=>q.parentElement.classList.toggle('open'));
}
function renderTimeline(){
  const items = [
    { d:'12', m:'фев', t:'Доставлено ♡', s:'Classic · мама сказала «спасибо»', st:['st-ok','получено'] },
    { d:'05', m:'фев', t:'В пути', s:'Classic · курьер рядом, фото отправлено', st:['st-way','в пути'] },
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
  $('#nextBtn').textContent = state.step===4 ? 'К оформлению →' : 'Далее →';
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
chipGroup('#styleChips','style'); chipGroup('#dayChips','day'); chipGroup('#timeChips','time'); chipGroup('#whoChips','who');

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
function updateCta(){
  const p = bouquetPrice();
  const desc = state.mode==='sub' ? `${SIZE_RU[state.size]} · ${state.freqLabel}` : state.mode==='once' ? `${SIZE_RU[state.size]} · разовый жест` : `${SIZE_RU[state.size]} · к дате`;
  $('#ctaPrice').textContent = fmt(p) + (state.mode==='sub' ? ' / букет' : '');
  $('#ctaDesc').textContent = desc;
  $('#myPlan').textContent = desc;
  $('#myPrice').textContent = fmt(p) + ' / букет';
  $('#ctaBtn').textContent = state.mode==='sub' ? 'Начать заботиться' : 'Отправить заботу';
  renderSummary();
}
function renderSummary(){
  const p = bouquetPrice();
  $('#summaryCard').innerHTML = `
    <div class="srow"><span>${state.who} · ${SIZE_RU[state.size]} · ${state.style}</span><span>${fmt(state.price)}</span></div>
    <div class="srow"><span>${state.mode==='sub'?'Подписка '+state.freqLabel:'Разово'}${state.promo?` · −${Math.round(state.promo*100)}%`:''}</span><span>−${fmt(state.price-p)}</span></div>
    <div class="srow"><span>${state.day} · ${state.time}</span><span>доставка 0 ₽</span></div>
    <div class="srow total"><span>Итого${state.mode==='sub'?' / месяц':''}</span><span>${fmt(monthTotal())}</span></div>`;
}

// ---------- sheet / checkout ----------
function openSheet(){
  const p = bouquetPrice();
  $('#cartBody').innerHTML = `
    <div class="cart-row"><span>✿ ${state.who} · ${SIZE_RU[state.size]} · ${state.style}<br><small style="color:var(--mut)">${state.mode==='sub'?state.freqLabel+' · '+state.perMonth+' букета/мес':state.mode==='once'?'разовый жест':'к дате'} · ${state.day}, ${state.time}</small></span><b>${fmt(p)}</b></div>
    <div class="cart-row"><span>Доставка · открытка</span><b>0 ₽</b></div>
    ${state.promo?`<div class="cart-row"><span>Промокод BLOOM15</span><b>−15%</b></div>`:''}`;
  $('#cartTotal').textContent = fmt(monthTotal());
  $('#sheetBg').classList.add('show'); $('#cartSheet').classList.add('show');
  if(tg?.MainButton){ tg.MainButton.setText(`Оформить · ${fmt(monthTotal())}`); tg.MainButton.show(); tg.MainButton.onClick(doCheckout); }
}
function closeSheet(){ $('#sheetBg').classList.remove('show'); $('#cartSheet').classList.remove('show'); tg?.MainButton?.hide(); }
$('#cartBtn').onclick = openSheet;
$('#ctaBtn').onclick = ()=>{ go('builder'); setStep(4); openSheet(); };
$('#closeSheet').onclick = closeSheet;
$('#sheetBg').onclick = closeSheet;

$('#promoBtn').onclick = ()=>{
  const v = $('#promoInput').value.trim().toUpperCase();
  if(v==='BLOOM15'){ state.promo=0.15; toast('Промокод применён: −15% ♡'); }
  else { state.promo=0; toast('Такого промокода нет'); }
  updateCta(); openSheet();
};

function doCheckout(){
  const name = $('#fName').value.trim(), addr = $('#fAddress').value.trim();
  if(state.mode==='sub' && (!name || !addr)){ toast('Подскажите имя и адрес близкого'); setStep(4); closeSheet(); go('builder'); return; }
  closeSheet();
  $('#successText').textContent = state.mode==='sub'
    ? `Первый букет (${SIZE_RU[state.size]}) приедет: ${state.day}, ${state.time}. Фото пришлём заранее.`
    : `Букет ${SIZE_RU[state.size]} для: ${state.who}. Привезём бережно и вовремя ♡`;
  $('#successView').classList.remove('hidden');
  try{ tg?.sendData?.(JSON.stringify({mode:state.mode, size:state.size, total:monthTotal(), who:state.who})); }catch(e){}
  $('#cartCount').textContent = state.mode==='sub' ? state.perMonth : 1;
  $('#profileName').textContent = tg?.initDataUnsafe?.user?.first_name || (name ? name : 'Заботливый');
  $('#avaLetter').textContent = ($('#profileName').textContent||'З')[0].toUpperCase();
  $('#profileSub').textContent = `${SIZE_RU[state.size]} · ${state.mode==='sub'?state.freqLabel:'разовый жест'} · ${fmt(monthTotal())}`;
  haptic('success');
}
$('#checkoutBtn').onclick = doCheckout;
$('#successOk').onclick = ()=>{ $('#successView').classList.add('hidden'); renderTimeline(); go('delivery'); };

// ---------- misc ----------
$('#skipBtn').onclick = ()=>toast('Четверг пропущен. Деньги не спишутся ♡');
function togglePause(){ state.paused=!state.paused; toast(state.paused?'Забота на паузе ⏸':'Забота снова активна ●'); }
$('#pauseBtn').onclick = togglePause; $('#pauseBtn2').onclick = togglePause;
$('#dateAdd').onclick = ()=>{
  const v = $('#dateInput').value.trim(); if(!v) return;
  const d = document.createElement('div'); d.className='date-row';
  d.innerHTML=`<div><b>${v}</b><span class="muted">напомним за 3 дня · привезём сами</span></div><span class="date-badge">помню ✓</span>`;
  $('#datesList').appendChild(d); $('#dateInput').value=''; toast('Запомнили. Не забудем ✓');
};
[['#addrBtn','Адреса близких скоро появятся здесь'],['#payBtn','Оплата: карта ···· 4021'],['#giftBtn','Подарить заботу: выберите тариф выше ☆'],['#helpBtn','Поддержка: напишите нам, ответим за 5 минут']].forEach(([s,m])=>{ $(s).onclick=()=>toast(m); });

// tg user
try{
  const u = tg?.initDataUnsafe?.user;
  if(u?.first_name){ $('#tgUser').textContent = `привет, ${u.first_name}!`; $('#profileName').textContent = u.first_name; $('#avaLetter').textContent = u.first_name[0].toUpperCase(); }
}catch(e){}

// init
(function init(){
  const d = new Date(); d.setDate(d.getDate()+3);
  const iso = d.toISOString().slice(0,10);
  const od = $('#onceDate'); if(od) od.value = iso;
  renderPlans(); renderReviews(); renderFaq(); renderTimeline(); setStep(1); updateCta();
})();
