/* RentHome Bali v2 — deal tabs + extended filters + characteristics */
const RATE = 16000;
const now = Date.now();
const H = 3600e3, M = 60e3;
const LISTINGS = [
{id:1,type:"offer",dealType:"rent",category:"monthly",title:"Вилла с бассейном в Чангу",price:25000000,currency:"IDR",propertyType:"villa_house",bedrooms:3,bathrooms:2,area:180,landArea:250,floors:2,yearBuilt:2021,furnished:true,parking:1,location:"Чангу",locationEn:"Canggu",lat:-8.6478,lng:115.1385,images:[1,2,3].map(i=>`https://picsum.photos/seed/bali1-${i}/640/360`),createdAt:now-4*M,isVerified:true,isAgent:true,agentName:"Иван",isTop:true,isUrgent:false,legal:true,rating:4.8,reviews:46,views:1240,mine:true},
{id:2,type:"offer",dealType:"rent",category:"monthly",title:"Квартира 1BR в Семиньяке",price:7500000,currency:"IDR",propertyType:"apartment",bedrooms:1,bathrooms:1,area:35,landArea:0,floors:5,yearBuilt:2022,furnished:true,parking:0,location:"Семиньяк",locationEn:"Seminyak",lat:-8.6905,lng:115.1665,images:[1,2].map(i=>`https://picsum.photos/seed/bali2-${i}/640/360`),createdAt:now-4*M,isVerified:true,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.6,reviews:46,views:860,mine:false},
{id:3,type:"offer",dealType:"rent",category:"monthly",title:"Дом 2 спальни в Убуде",price:12000000,currency:"IDR",propertyType:"villa_house",bedrooms:2,bathrooms:2,area:95,landArea:150,floors:1,yearBuilt:2019,furnished:true,parking:1,location:"Убуд",locationEn:"Ubud",lat:-8.5069,lng:115.2625,images:[1,2,3,4].map(i=>`https://picsum.photos/seed/bali3-${i}/640/360`),createdAt:now-2*H,isVerified:false,isAgent:true,agentName:"Made",isTop:false,isUrgent:true,legal:true,rating:4.9,reviews:21,views:540,mine:false},
{id:4,type:"offer",dealType:"rent",category:"monthly",title:"Sewa Kos в Улувату у океана",price:3500000,currency:"IDR",propertyType:"boarding",bedrooms:1,bathrooms:1,area:20,landArea:0,floors:2,yearBuilt:2020,furnished:true,parking:0,location:"Улувату",locationEn:"Uluwatu",lat:-8.8150,lng:115.1725,images:[`https://picsum.photos/seed/bali4-1/640/360`],createdAt:now-26*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.2,reviews:8,views:210,mine:false},
{id:5,type:"offer",dealType:"rent",category:"yearly",title:"Таунхаус в Сануре (год)",price:180000000,currency:"IDR",propertyType:"townhouse",bedrooms:3,bathrooms:2,area:120,landArea:110,floors:2,yearBuilt:2021,furnished:false,parking:1,location:"Санур",locationEn:"Sanur",lat:-8.6930,lng:115.2628,images:[1,2,3].map(i=>`https://picsum.photos/seed/bali5-${i}/640/360`),createdAt:now-5*H,isVerified:true,isAgent:false,isTop:true,isUrgent:false,legal:true,rating:4.7,reviews:33,views:980,mine:true},
{id:6,type:"offer",dealType:"rent",category:"monthly",title:"Вилла в Нуса-Дуа",price:45000000,currency:"IDR",propertyType:"villa_house",bedrooms:4,bathrooms:3,area:250,landArea:400,floors:2,yearBuilt:2023,furnished:true,parking:2,location:"Нуса-Дуа",locationEn:"Nusa Dua",lat:-8.7962,lng:115.2229,images:[1,2].map(i=>`https://picsum.photos/seed/bali6-${i}/640/360`),createdAt:now-50*M,isVerified:true,isAgent:true,agentName:"Ketut",isTop:false,isUrgent:false,legal:true,rating:5.0,reviews:12,views:430,mine:false},
{id:7,type:"offer",dealType:"rent",category:"monthly",title:"Дом в Денпасаре для семьи",price:9000000,currency:"IDR",propertyType:"villa_house",bedrooms:3,bathrooms:1,area:110,landArea:140,floors:1,yearBuilt:2018,furnished:false,parking:1,location:"Денпасар",locationEn:"Denpasar",lat:-8.6705,lng:115.2126,images:[1,2,3].map(i=>`https://picsum.photos/seed/bali7-${i}/640/360`),createdAt:now-3*24*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.3,reviews:15,views:300,mine:false},
{id:8,type:"offer",dealType:"rent",category:"monthly",title:"Пентхаус в Семиньяке",price:30000000,currency:"IDR",propertyType:"apartment",bedrooms:2,bathrooms:2,area:85,landArea:0,floors:8,yearBuilt:2022,furnished:true,parking:1,location:"Семиньяк",locationEn:"Seminyak",lat:-8.6871,lng:115.1674,images:[1,2,3].map(i=>`https://picsum.photos/seed/bali8-${i}/640/360`),createdAt:now-10*H,isVerified:true,isAgent:true,agentName:"Anna",isTop:true,isUrgent:false,legal:true,rating:4.9,reviews:58,views:2100,mine:false},
{id:9,type:"offer",dealType:"rent",category:"yearly",title:"Вилла в Джимбаране (год)",price:240000000,currency:"IDR",propertyType:"villa_house",bedrooms:5,bathrooms:4,area:300,landArea:500,floors:3,yearBuilt:2020,furnished:true,parking:2,location:"Джимбаран",locationEn:"Jimbaran",lat:-8.7775,lng:115.1637,images:[1,2].map(i=>`https://picsum.photos/seed/bali9-${i}/640/360`),createdAt:now-30*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.5,reviews:19,views:670,mine:false},
{id:10,type:"offer",dealType:"rent",category:"monthly",title:"Студия в Чангу",price:6000000,currency:"IDR",propertyType:"apartment",bedrooms:1,bathrooms:1,area:28,landArea:0,floors:3,yearBuilt:2023,furnished:true,parking:0,location:"Чангу",locationEn:"Canggu",lat:-8.6499,lng:115.1339,images:[1,2].map(i=>`https://picsum.photos/seed/bali10-${i}/640/360`),createdAt:now-20*M,isVerified:false,isAgent:false,isTop:false,isUrgent:true,legal:false,rating:4.4,reviews:9,views:390,mine:false},
{id:17,type:"offer",dealType:"sale",title:"Вилла с бассейном в Убуде — продажа",price:4500000000,currency:"IDR",propertyType:"villa_house",bedrooms:3,bathrooms:3,area:200,landArea:300,floors:2,yearBuilt:2021,furnished:true,parking:2,location:"Убуд",locationEn:"Ubud",lat:-8.5120,lng:115.2700,images:[1,2,3].map(i=>`https://picsum.photos/seed/sale17-${i}/640/360`),createdAt:now-6*H,isVerified:true,isAgent:true,agentName:"Wayan",isTop:true,isUrgent:false,legal:true,rating:4.9,reviews:27,views:1500,mine:true},
{id:18,type:"offer",dealType:"sale",title:"Земля 10 соток в Улувату",price:2800000000,currency:"IDR",propertyType:"land",bedrooms:0,bathrooms:0,area:0,landArea:1000,floors:0,yearBuilt:0,furnished:false,parking:0,location:"Улувату",locationEn:"Uluwatu",lat:-8.8200,lng:115.1750,images:[1,2].map(i=>`https://picsum.photos/seed/sale18-${i}/640/360`),createdAt:now-14*H,isVerified:true,isAgent:false,isTop:false,isUrgent:false,legal:true,rating:4.7,reviews:11,views:620,mine:false},
{id:19,type:"offer",dealType:"sale",title:"Коммерческое помещение в Куте",price:5200000000,currency:"IDR",propertyType:"commercial",bedrooms:0,bathrooms:2,area:150,landArea:120,floors:2,yearBuilt:2019,furnished:false,parking:3,location:"Кута",locationEn:"Kuta",lat:-8.7184,lng:115.1686,images:[1,2].map(i=>`https://picsum.photos/seed/sale19-${i}/640/360`),createdAt:now-2*24*H,isVerified:false,isAgent:true,agentName:"Made",isTop:false,isUrgent:false,legal:true,rating:4.5,reviews:7,views:410,mine:false},
{id:20,type:"offer",dealType:"sale",title:"Квартира 2BR в Денпасаре",price:1800000000,currency:"IDR",propertyType:"apartment",bedrooms:2,bathrooms:1,area:60,landArea:0,floors:10,yearBuilt:2022,furnished:true,parking:1,location:"Денпасар",locationEn:"Denpasar",lat:-8.6720,lng:115.2150,images:[1,2].map(i=>`https://picsum.photos/seed/sale20-${i}/640/360`),createdAt:now-1*H,isVerified:true,isAgent:false,isTop:false,isUrgent:true,legal:false,rating:4.6,reviews:14,views:530,mine:false},
{id:11,type:"request",dealType:"rent",category:"monthly",title:"Сниму 1BR в Чангу до 8 млн",price:8000000,currency:"IDR",propertyType:"apartment",bedrooms:1,bathrooms:1,area:30,landArea:0,floors:0,yearBuilt:0,furnished:true,parking:0,location:"Чангу",locationEn:"Canggu",lat:-8.6500,lng:115.1400,images:[`https://picsum.photos/seed/req11/640/360`],createdAt:now-40*M,isVerified:true,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:0,reviews:3,views:120,moveIn:"2026-10-01"},
{id:12,type:"request",dealType:"sale",title:"Куплю виллу в Улувату",price:3500000000,currency:"IDR",propertyType:"villa_house",bedrooms:3,bathrooms:2,area:200,landArea:250,floors:2,yearBuilt:0,furnished:false,parking:0,location:"Улувату",locationEn:"Uluwatu",lat:-8.8100,lng:115.1700,images:[`https://picsum.photos/seed/req12/640/360`],createdAt:now-3*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:0,reviews:1,views:80,moveIn:"2026-11-15"},
{id:13,type:"request",dealType:"rent",category:"monthly",title:"Сниму дом в Убуде на 3 мес",price:10000000,currency:"IDR",propertyType:"villa_house",bedrooms:2,bathrooms:1,area:80,landArea:100,floors:1,yearBuilt:0,furnished:true,parking:0,location:"Убуд",locationEn:"Ubud",lat:-8.5100,lng:115.2600,images:[`https://picsum.photos/seed/req13/640/360`],createdAt:now-12*H,isVerified:true,isAgent:false,isTop:true,isUrgent:false,legal:false,rating:0,reviews:5,views:230,moveIn:"2026-09-20"},
{id:14,type:"request",dealType:"rent",category:"monthly",title:"Ищу sewa kos в Семиньяке",price:4000000,currency:"IDR",propertyType:"boarding",bedrooms:1,bathrooms:1,area:18,landArea:0,floors:0,yearBuilt:0,furnished:true,parking:0,location:"Семиньяк",locationEn:"Seminyak",lat:-8.6900,lng:115.1650,images:[`https://picsum.photos/seed/req14/640/360`],createdAt:now-8*H,isVerified:false,isAgent:false,isTop:false,isUrgent:true,legal:false,rating:0,reviews:2,views:150,moveIn:"2026-09-10"},
{id:15,type:"request",dealType:"rent",category:"yearly",title:"Сниму таунхаус в Сануре на год",price:150000000,currency:"IDR",propertyType:"townhouse",bedrooms:3,bathrooms:2,area:110,landArea:100,floors:2,yearBuilt:0,furnished:false,parking:1,location:"Санур",locationEn:"Sanur",lat:-8.6950,lng:115.2600,images:[`https://picsum.photos/seed/req15/640/360`],createdAt:now-2*24*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:0,reviews:0,views:60,moveIn:"2026-10-10"},
{id:16,type:"request",dealType:"sale",title:"Куплю квартиру в Денпасаре",price:1200000000,currency:"IDR",propertyType:"apartment",bedrooms:2,bathrooms:1,area:60,landArea:0,floors:0,yearBuilt:0,furnished:false,parking:0,location:"Денпасар",locationEn:"Denpasar",lat:-8.6710,lng:115.2100,images:[`https://picsum.photos/seed/req16/640/360`],createdAt:now-30*M,isVerified:true,isAgent:true,agentName:"Wayan",isTop:false,isUrgent:false,legal:true,rating:0,reviews:4,views:190,moveIn:"2026-12-01"},
{id:21,type:"offer",dealType:"rent",category:"yearly",title:"Земля в аренду в Табанане — 25 лет",price:85000000,currency:"IDR",propertyType:"land",bedrooms:0,bathrooms:0,area:0,landArea:800,floors:0,yearBuilt:0,furnished:false,parking:0,location:"Табанан",locationEn:"Tabanan",lat:-8.5416,lng:115.1247,images:[1,2].map(i=>`https://picsum.photos/seed/land21-${i}/640/360`),createdAt:now-3*H,isVerified:true,isAgent:false,isTop:false,isUrgent:false,legal:true,rating:4.6,reviews:6,views:320,mine:false},
{id:22,type:"offer",dealType:"rent",category:"monthly",title:"Участок под глэмпинг в Убуде",price:7000000,currency:"IDR",propertyType:"land",bedrooms:0,bathrooms:0,area:0,landArea:500,floors:0,yearBuilt:0,furnished:false,parking:0,location:"Убуд",locationEn:"Ubud",lat:-8.5200,lng:115.2700,images:[`https://picsum.photos/seed/land22-1/640/360`],createdAt:now-7*H,isVerified:false,isAgent:true,agentName:"Ketut",isTop:false,isUrgent:true,legal:false,rating:4.4,reviews:4,views:180,mine:false},
{id:23,type:"offer",dealType:"rent",category:"monthly",title:"Homestay в Чангу с завтраками",price:5500000,currency:"IDR",propertyType:"homestay",bedrooms:1,bathrooms:1,area:24,landArea:0,floors:2,yearBuilt:2021,furnished:true,parking:0,location:"Чангу",locationEn:"Canggu",lat:-8.6550,lng:115.1450,images:[1,2,3].map(i=>`https://picsum.photos/seed/home23-${i}/640/360`),createdAt:now-90*M,isVerified:true,isAgent:false,isTop:true,isUrgent:false,legal:false,rating:4.9,reviews:64,views:1120,mine:false},
{id:24,type:"offer",dealType:"rent",category:"monthly",title:"Homestay в Убуде — тихо и зелено",price:4200000,currency:"IDR",propertyType:"homestay",bedrooms:1,bathrooms:1,area:22,landArea:0,floors:1,yearBuilt:2020,furnished:true,parking:0,location:"Убуд",locationEn:"Ubud",lat:-8.5150,lng:115.2550,images:[1,2].map(i=>`https://picsum.photos/seed/home24-${i}/640/360`),createdAt:now-11*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.7,reviews:31,views:540,mine:false},
];

const I18N = {
ru:{topbar:"Проверенные объекты Бали · прозрачная цена · русскоязычная поддержка",deal_buy:"Купить",deal_rent:"Арендовать",deal_map:"Карта",tab_offer:"Сдам / Продам",tab_request:"Сниму / Куплю",sub_hint:"предлагаю / ищу",price:"Цена",ptype:"Тип недвижимости",all:"Все",any:"Любой",any_area:"Вся Бали",bedrooms:"Спальни",district:"Локация",apply:"Показать",reset:"Сбросить",filters:"Фильтры",advanced:"Расширенный",rent_cat:"Срок",monthly:"мес",yearly:"год",land_area:"Участок, м²",build_area:"Строение, м²",floors:"Этажей",year:"Год от",furn:"Меблировка",yes:"Да",no:"Нет",parking:"Парковка",s_date:"Сначала новые",s_price_asc:"Дешевле",s_price_desc:"Дороже",s_pop:"Популярные",empty:"Ничего не найдено. Попробуйте сбросить фильтры.",fav_title:"Избранное",fav_empty:"Пока пусто. Нажмите ♡ на карточке, чтобы сохранить.",verified:"Проверено",owner:"Собственник",my_listings:"Мои объявления",nav_list:"Каталог",nav_map:"Карта",nav_fav:"Сохранённое",nav_profile:"Профиль",filters_hint:"Задайте значения и нажмите Показать.",variants:"вариантов",new:"New",top:"Топ",agent:"Агент",urgent:"Срочно",offer_btn:"Предложить вариант",legal_txt:"Юр. сопровождение",move_in:"Заезд",month:"/ мес",year_per:"/ год",total:"total",new_objects:"Новые объекты недвижимости",q_buy_house:"Купить дом",q_buy_land:"Купить землю",q_rent_house:"Арендовать дом",q_rent_land:"Аренда земли",q_homestay:"Homestay",q_rent_board:"Sewa Kos",q_sim:"Моделирование кредита",sim_hint:"Simulasi Kredit — прикиньте ежемесячный платёж.",sim_price:"Цена объекта",sim_dp:"Первый взнос, %",sim_rate:"Ставка, % годовых",sim_years:"Срок, лет",sim_go:"Рассчитать",map_hint:"Фильтры применяются к карте.",f_product:"Продукт",f_help:"Помощь",f_policy:"Право",home:"Главная",long_rent:"Аренда · помесячно",year_rent:"Аренда · на год",sale_h:"Покупка",offer_h:"Предлагаю",request_h:"Ищу",t_villa_house:"Виллы и дома",t_apartment:"Квартиры",t_homestay:"Homestay",t_land:"Земельные участки",t_commercial:"Коммерческая",t_townhouse:"Таунхаусы",t_boarding:"Sewa Kos",char_land:"Участок",char_house:"Дом",char_floors:"Эт.",char_bed:"сп.",char_bath:"ван.",char_year:""},
en:{topbar:"Verified Bali listings · transparent pricing · EN support",deal_buy:"Buy",deal_rent:"Rent",deal_map:"Map",tab_offer:"Offer",tab_request:"Wanted",sub_hint:"offer / wanted",price:"Price",ptype:"Property type",all:"All",any:"Any",any_area:"All Bali",bedrooms:"Bedrooms",district:"Location",apply:"Show",reset:"Reset",filters:"Filters",advanced:"Advanced",rent_cat:"Term",monthly:"mo",yearly:"yr",land_area:"Land, m²",build_area:"Building, m²",floors:"Floors",year:"Year from",furn:"Furnished",yes:"Yes",no:"No",parking:"Parking",s_date:"Newest",s_price_asc:"Cheapest",s_price_desc:"Priciest",s_pop:"Popular",empty:"Nothing found. Try resetting filters.",fav_title:"Favorites",fav_empty:"Empty yet. Tap ♡ on a card to save.",verified:"Verified",owner:"Owner",my_listings:"My listings",nav_list:"Catalog",nav_map:"Map",nav_fav:"Saved",nav_profile:"Profile",filters_hint:"Set values and press Show.",variants:"places",new:"New",top:"Top",agent:"Agent",urgent:"Urgent",offer_btn:"Propose option",legal_txt:"Legal support",move_in:"Move-in",month:"/ mo",year_per:"/ yr",total:"total",new_objects:"New properties",q_buy_house:"Buy house",q_buy_land:"Buy land",q_rent_house:"Rent house",q_rent_land:"Land lease",q_homestay:"Homestay",q_rent_board:"Sewa Kos",q_sim:"Credit simulation",sim_hint:"Simulasi Kredit — estimate your monthly payment.",sim_price:"Price",sim_dp:"Down payment, %",sim_rate:"Rate, % yearly",sim_years:"Term, years",sim_go:"Calculate",map_hint:"Filters apply to the map.",f_product:"Product",f_help:"Help",f_policy:"Legal",home:"Home",long_rent:"Rent · monthly",year_rent:"Rent · yearly",sale_h:"Sale",offer_h:"Offer",request_h:"Wanted",t_villa_house:"Villas & houses",t_apartment:"Apartments",t_homestay:"Homestay",t_land:"Land plots",t_commercial:"Commercial",t_townhouse:"Townhouses",t_boarding:"Sewa Kos",char_land:"Land",char_house:"House",char_floors:"fl.",char_bed:"bd",char_bath:"ba",char_year:""}
};

const state = {deal:"rent",role:"offer",rentCat:"monthly",view:"list",page:1,perPage:9,sort:"date_desc",lang:"ru",currency:"IDR",fav:new Set(JSON.parse(localStorage.getItem("rh_fav")||"[]")),carIdx:{}};
let map=null, markers=[];
const $ = id=>document.getElementById(id);
const t = k=>I18N[state.lang][k]||k;
const isNew = it=>(Date.now()-it.createdAt)<24*H;

function convertPrice(v){return state.currency==="USD"?Math.round(v/RATE):v;}
function fmtNum(v){return state.currency==="USD"?convertPrice(v).toLocaleString("en-US"):v.toLocaleString("ru-RU");}
function curSuffix(){return state.currency;}
function fmtPrice(it){
  const prefix = it.type==="request"?(state.lang==="ru"?"до ":"up to "):"";
  if(it.dealType==="sale")return `${prefix}${state.currency==="USD"?"$ ":""}${fmtNum(it.price)} ${curSuffix()}${state.lang==="ru"?" "+t("total"):" "+t("total")}`;
  const per = it.category==="yearly"?t("year_per"):t("month");
  return `${prefix}${state.currency==="USD"?"$ ":""}${fmtNum(it.price)} ${curSuffix()} ${per}`;
}
function timeAgo(ts){
  const d=Date.now()-ts, m=Math.floor(d/M), h=Math.floor(d/H), days=Math.floor(h/24);
  if(state.lang==="ru"){if(m<1)return"только что";if(m<60)return`${m} мин. назад`;if(h<24)return`${h} ч. назад`;if(days===1)return"вчера";return`${days} дн. назад`;}
  if(m<1)return"just now";if(m<60)return`${m} min ago`;if(h<24)return`${h} h ago`;if(days===1)return"yesterday";return`${days} days ago`;
}
function pTypeLabel(v){return t("t_"+v)||v;}
function locLabel(it){return state.lang==="ru"?it.location:it.locationEn||it.location;}

function charsHTML(it){
  const c=[];
  if(it.landArea>0)c.push(`<span class="char-item">◍ ${it.landArea} м²</span>`);
  if(it.area>0)c.push(`<span class="char-item">⌂ ${it.area} м²</span>`);
  if(it.bedrooms>0)c.push(`<span class="char-item">▤ ${it.bedrooms} ${t("char_bed")}</span>`);
  if(it.bathrooms>0)c.push(`<span class="char-item">◐ ${it.bathrooms} ${t("char_bath")}</span>`);
  if(it.floors>0)c.push(`<span class="char-item">▦ ${it.floors} ${t("char_floors")}</span>`);
  if(it.yearBuilt>0)c.push(`<span class="char-item">· ${it.yearBuilt}</span>`);
  if(!c.length)return"";
  return `<div class="card-characteristics">${c.join("")}</div>`;
}

function cardHTML(it){
  const idx=state.carIdx[it.id]||0;
  const fav=state.fav.has(it.id)?"active":"";
  const heart=state.fav.has(it.id)?"♥":"♡";
  let badges="";
  if(isNew(it))badges+=`<span class="badge new">${t("new")}</span>`;
  if(it.isVerified)badges+=`<span class="badge verified">✔ ${t("verified")}</span>`;
  if(it.isTop)badges+=`<span class="badge top">${t("top")}</span>`;
  if(it.isAgent)badges+=`<span class="badge agent">${t("agent")}${it.agentName?" · "+it.agentName:""}</span>`;
  if(it.isUrgent)badges+=`<span class="badge urgent">${t("urgent")}</span>`;
  const extra=it.type==="request"
    ?`<div class="muted" style="font-size:13px">${t("move_in")}: ${it.moveIn||"—"}</div><button class="offer-btn" data-offer="${it.id}">${t("offer_btn")} →</button>`
    :`${it.legal?`<div class="legal">◈ ${t("legal_txt")}</div>`:""}`;
  const sub=it.dealType==="sale"
    ?`${pTypeLabel(it.propertyType)}`
    :`${pTypeLabel(it.propertyType)} · ${it.bedrooms} ${t("char_bed")}`;
  const per=it.dealType==="sale"?t("total"):(it.category==="yearly"?t("year_per"):t("month"));
  const priceOnly=fmtPrice(it).replace(per,"").trim();
  return `<article class="listing" data-card="${it.id}">
    <div class="media"><img loading="lazy" decoding="async" src="${it.images[idx%it.images.length]}" alt="">
      ${it.images.length>1?`<button class="car-btn prev" data-car="prev" data-id="${it.id}" aria-label="prev">‹</button><button class="car-btn next" data-car="next" data-id="${it.id}" aria-label="next">›</button>`:""}
      <span class="photo-counter">${(idx%it.images.length)+1} / ${it.images.length}</span>
      <div class="badges">${badges}</div>
      <button class="favorite-btn ${fav}" data-fav="${it.id}" aria-label="fav">${heart}</button></div>
    <div class="body"><div class="price-row"><div class="price">${priceOnly}</div><div class="per">${per} · ${state.currency}</div></div>
      <div class="title">${it.title||sub}</div>
      <div class="location"><span>◎</span> ${locLabel(it)} · ${sub}</div>
      ${charsHTML(it)}
      <div class="meta"><span>★ ${it.rating?it.rating.toFixed(1):"—"} · ${it.reviews} · 👁 ${it.views}</span><span>${timeAgo(it.createdAt)}</span></div>
      ${extra}</div></article>`;
}

function convToIDR(v){ // input in current currency -> IDR for compare
  v=parseFloat(v); if(isNaN(v))return NaN;
  return state.currency==="USD"?v*RATE:v;
}

function getFiltered(){
  let arr=LISTINGS.filter(x=>x.dealType===state.deal&&x.type===state.role);
  const gv=id=>$(id)?$(id).value.trim():"";
  const pMin=convToIDR(gv("priceMin")),pMax=convToIDR(gv("priceMax"));
  const lMin=parseFloat(gv("landMin")),lMax=parseFloat(gv("landMax"));
  const aMin=parseFloat(gv("areaMin")),aMax=parseFloat(gv("areaMax"));
  const fT=gv("fType"),fR=gv("fRooms"),fD=gv("fDistrict").toLowerCase();
  const fFl=gv("fFloors"),fY=parseFloat(gv("fYear")),fFu=gv("fFurn"),fP=gv("fPark");
  if(state.deal==="rent"&&state.rentCat)arr=arr.filter(x=>x.category===state.rentCat);
  if(!isNaN(pMin))arr=arr.filter(x=>x.price>=pMin);
  if(!isNaN(pMax))arr=arr.filter(x=>x.price<=pMax);
  if(fT)arr=arr.filter(x=>x.propertyType===fT||(fT==="villa_house"&&(x.propertyType==="villa"||x.propertyType==="house")));
  if(fR)arr=arr.filter(x=>fR==="5"?x.bedrooms>=5:x.bedrooms==+fR);
  if(fD)arr=arr.filter(x=>x.location.toLowerCase().includes(fD)||(x.locationEn||"").toLowerCase().includes(fD));
  if(!isNaN(lMin))arr=arr.filter(x=>(x.landArea||0)>=lMin);
  if(!isNaN(lMax))arr=arr.filter(x=>(x.landArea||0)<=lMax);
  if(!isNaN(aMin))arr=arr.filter(x=>(x.area||0)>=aMin);
  if(!isNaN(aMax))arr=arr.filter(x=>(x.area||0)<=aMax);
  if(fFl)arr=arr.filter(x=>fFl==="5"?(x.floors||0)>=5:(x.floors||0)==+fFl);
  if(!isNaN(fY))arr=arr.filter(x=>(x.yearBuilt||0)>=fY);
  if(fFu==="yes")arr=arr.filter(x=>x.furnished);
  if(fFu==="no")arr=arr.filter(x=>!x.furnished);
  if(fP)arr=arr.filter(x=>(x.parking||0)>=+fP);
  if(state.sort==="price_asc")arr.sort((a,b)=>a.price-b.price);
  else if(state.sort==="price_desc")arr.sort((a,b)=>b.price-a.price);
  else if(state.sort==="popular")arr.sort((a,b)=>b.views-a.views);
  else arr.sort((a,b)=>b.createdAt-a.createdAt);
  return arr;
}

function renderCrumbs(){
  const dealName=state.deal==="sale"?t("sale_h"):(state.rentCat==="yearly"?t("year_rent"):t("long_rent"));
  const roleName=state.role==="offer"?t("offer_h"):t("request_h");
  const typeName=$("fType").value?pTypeLabel($("fType").value):"—";
  const distName=$("fDistrict").value||"—";
  $("crumbs").innerHTML=`<button data-crumb="home">${t("home")}</button><span class="sep">/</span>
    <button data-crumb="deal">${dealName}</button><span class="sep">/</span>
    <button data-crumb="role">${roleName}</button><span class="sep">/</span>
    <span>${typeName} · ${distName}</span>`;
}

function render(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=t(el.dataset.i18n);});
  $("favCount").textContent=state.fav.size;
  $("curLabel").textContent=state.currency;
  $("rentCatWrap").style.display=state.deal==="rent"?"":"none";
  document.querySelectorAll(".seg-btn").forEach(b=>b.classList.toggle("active",b.dataset.cat===state.rentCat));
  renderCrumbs();
  const arr=getFiltered();
  $("resultsCount").textContent=`${arr.length} ${t("variants")}`;
  if($("statCount"))$("statCount").textContent=LISTINGS.length;
  if($("heroTitle"))$("heroTitle").textContent=state.deal==="sale"
    ?(state.lang==="ru"?"Покупка на Бали без лишнего шума":"Buy in Bali, no noise")
    :(state.lang==="ru"?"Аренда на Бали без лишнего шума":"Rent in Bali, no noise");
  if($("advBtn"))$("advBtn").textContent=t("advanced")+($("advPanel").classList.contains("hidden")?"  +":"  –");
  const pages=Math.max(1,Math.ceil(arr.length/state.perPage));
  if(state.page>pages)state.page=pages;
  const slice=arr.slice((state.page-1)*state.perPage,state.page*state.perPage);
  $("cardsGrid").innerHTML=slice.map(cardHTML).join("");
  $("emptyState").classList.toggle("hidden",slice.length>0);
  $("pagination").innerHTML=Array.from({length:pages},(_,i)=>`<button class="${state.page===i+1?"active":""}" data-page="${i+1}">${i+1}</button>`).join("");
  const favs=LISTINGS.filter(x=>state.fav.has(x.id));
  $("favGrid").innerHTML=favs.map(cardHTML).join("");
  $("favEmpty").style.display=favs.length?"none":"block";
  $("myGrid").innerHTML=LISTINGS.filter(x=>x.mine).map(cardHTML).join("");
  $("mapList").innerHTML=arr.slice(0,20).map(x=>`<div class="map-mini" data-card="${x.id}"><b>${fmtPrice(x)}</b> · ${pTypeLabel(x.propertyType)}<br>📍 ${locLabel(x)}</div>`).join("");
}

function switchView(v){
  state.view=v;
  ["list","map","fav","profile"].forEach(k=>$("view-"+k).classList.toggle("hidden",k!==v));
  document.querySelectorAll(".bn-item").forEach(b=>b.classList.toggle("active",b.dataset.view===v));
  if(v==="map")setTimeout(initMap,50);
}
function setDeal(d){
  if(d==="map"){switchView("map");syncDealTabs();return;}
  state.deal=d;state.page=1;switchView("list");syncDealTabs();render();updateMarkersSafe();
}
function syncDealTabs(){
  $("dealRent").classList.toggle("active",state.deal==="rent"&&state.view!=="map");
  $("dealBuy").classList.toggle("active",state.deal==="sale"&&state.view!=="map");
  $("dealMap").classList.toggle("active",state.view==="map");
}
let leafletReady=null;
function loadLeaflet(){
  if(window.L)return Promise.resolve();
  if(leafletReady)return leafletReady;
  leafletReady=new Promise((res,rej)=>{
    const css=document.createElement("link");css.rel="stylesheet";css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(css);
    const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";s.onload=res;s.onerror=rej;document.body.appendChild(s);
  });
  return leafletReady;
}
function initMap(){
  loadLeaflet().then(()=>{
    if(map){updateMarkers();map.invalidateSize();return;}
    map=L.map("map").setView([-8.65,115.17],10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18}).addTo(map);
    updateMarkers();
  });
}
function updateMarkers(){
  if(!map)return;
  markers.forEach(m=>m.remove());markers=[];
  getFiltered().forEach(it=>{
    const m=L.marker([it.lat,it.lng]).addTo(map);
    m.bindPopup(`<b>${fmtPrice(it)}</b><br>${pTypeLabel(it.propertyType)}<br>📍 ${locLabel(it)}`);
    markers.push(m);
  });
}
function updateMarkersSafe(){if(map)updateMarkers();}

function openDetail(id){
  const it=LISTINGS.find(x=>x.id==id);if(!it)return;
  $("detailContent").innerHTML=`
    <div class="detail-gallery">${it.images.map(s=>`<img src="${s}" loading="lazy">`).join("")}</div>
    <h2>${it.title||pTypeLabel(it.propertyType)}</h2>
    <div class="price" style="margin:8px 0">${fmtPrice(it)}</div>
    <p class="muted">${pTypeLabel(it.propertyType)} · ▤ ${it.bedrooms} · ◐ ${it.bathrooms||"—"} · ⌂ ${it.area||"—"} м² ${it.landArea?`· ◍ ${it.landArea} м²`:""} ${it.floors?`· ▦ ${it.floors}`:""} ${it.yearBuilt?`· ${it.yearBuilt}`:""}</p>
    <p class="muted">◎ ${locLabel(it)} · ${timeAgo(it.createdAt)} · 👁 ${it.views} · ★ ${it.rating||"—"} (${it.reviews})</p>
    <p>${it.furnished?(state.lang==="ru"?"Меблировано":"Furnished")+" · ":""}${it.parking?`Parking ${it.parking} · `:""}${it.isVerified?"✔ "+t("verified")+" · ":""}${it.isAgent?t("agent")+": "+(it.agentName||"")+" · ":""}${it.isTop?t("top"):""}</p>
    ${it.legal?`<p class="legal">◈ ${t("legal_txt")}</p>`:""}
    ${it.type==="request"?`<p>${t("move_in")}: ${it.moveIn||"—"}</p><button class="btn-primary" onclick="alert('OK!')">${t("offer_btn")} →</button>`:`<button class="btn-primary" data-fav="${it.id}">${state.fav.has(it.id)?"♥":"♡"} ${t("nav_fav")}</button>`}`;
  $("detailModal").classList.remove("hidden");
}

document.addEventListener("click",e=>{
  const f=e.target.closest("[data-fav]");
  if(f){e.stopPropagation();const id=+f.dataset.fav;state.fav.has(id)?state.fav.delete(id):state.fav.add(id);localStorage.setItem("rh_fav",JSON.stringify([...state.fav]));render();return;}
  const c=e.target.closest("[data-car]");
  if(c){e.stopPropagation();const id=+c.dataset.id;const it=LISTINGS.find(x=>x.id===id);let i=state.carIdx[id]||0;i=(i+(c.dataset.car==="next"?1:-1)+it.images.length)%it.images.length;state.carIdx[id]=i;render();return;}
  const o=e.target.closest("[data-offer]");
  if(o){e.stopPropagation();alert(state.lang==="ru"?"Заявка отправлена владельцу запроса!":"Proposal sent!");return;}
  const p=e.target.closest("[data-page]");
  if(p){state.page=+p.dataset.page;render();window.scrollTo({top:0,behavior:"smooth"});return;}
  const cr=e.target.closest("[data-crumb]");
  if(cr){const k=cr.dataset.crumb;if(k==="home")resetFilters();if(k==="deal"){$("fType").value="";$("fDistrict").value="";}if(k==="role"){}state.page=1;render();return;}
  const q=e.target.closest("[data-q]");
  if(q){applyQuick(q.dataset.q);return;}
  const card=e.target.closest("[data-card]");
  if(card&&!e.target.closest("button")){openDetail(card.dataset.card);return;}
  const bn=e.target.closest(".bn-item");
  if(bn){switchView(bn.dataset.view);syncDealTabs();return;}
});

function resetFilters(){
  ["priceMin","priceMax","landMin","landMax","areaMin","areaMax","fYear"].forEach(id=>{if($(id))$(id).value="";});
  $("fType").value="";$("fRooms").value="";$("fDistrict").value="";$("fFloors").value="";$("fFurn").value="";$("fPark").value="";
  state.page=1;activeQuick="";highlightQuick();
}
let activeQuick="";
function applyQuick(key){
  if(key==="sim_credit"){openCredit();return;}
  resetFilters();
  activeQuick=key;
  if(key==="buy_house"){state.deal="sale";state.role="offer";$("fType").value="villa_house";syncRoleTabs();}
  if(key==="buy_land"){state.deal="sale";state.role="offer";$("fType").value="land";syncRoleTabs();}
  if(key==="rent_house"){state.deal="rent";state.role="offer";$("fType").value="villa_house";state.rentCat="";syncRoleTabs();}
  if(key==="rent_land"){state.deal="rent";state.role="offer";$("fType").value="land";state.rentCat="";syncRoleTabs();}
  if(key==="homestay"){state.deal="rent";state.role="offer";$("fType").value="homestay";state.rentCat="";syncRoleTabs();}
  if(key==="rent_board"){state.deal="rent";state.role="offer";$("fType").value="boarding";state.rentCat="";syncRoleTabs();}
  state.page=1;switchView("list");syncDealTabs();render();highlightQuick();window.scrollTo({top:0,behavior:"smooth"});
}
function highlightQuick(){document.querySelectorAll("#quickLinks button").forEach(b=>b.classList.toggle("active",b.dataset.q===activeQuick));}
function syncRoleTabs(){$("tabOffer").classList.toggle("active",state.role==="offer");$("tabRequest").classList.toggle("active",state.role==="request");}
function openCredit(){$("creditModal").classList.remove("hidden");calcCredit();}
function calcCredit(){
  const P=parseFloat($("simPrice").value)||0, dp=parseFloat($("simDP").value)||0, rate=parseFloat($("simRate").value)||0, yrs=parseFloat($("simYears").value)||0;
  const loan=P*(1-dp/100), r=rate/100/12, n=yrs*12;
  let m=0; if(loan>0&&n>0){m=r>0?loan*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):loan/n;}
  const cur=state.currency==="USD"?"$":"IDR";
  const val=state.currency==="USD"?Math.round(m/RATE).toLocaleString("en-US"):Math.round(m).toLocaleString("ru-RU");
  $("simResult").textContent=`≈ ${val} ${cur} / мес`;
}

$("applyBtn").onclick=()=>{state.page=1;render();if(state.view!=="list")switchView("list");syncDealTabs();updateMarkersSafe();if(window.innerWidth<768)$("filtersBar").classList.remove("open");};
$("resetBtn").onclick=()=>{resetFilters();state.rentCat="";render();};
$("advBtn").onclick=()=>$("advPanel").classList.toggle("hidden");
$("sortSelect").onchange=e=>{state.sort=e.target.value;state.page=1;render();};
$("dealRent").onclick=()=>setDeal("rent");
$("dealBuy").onclick=()=>setDeal("sale");
$("dealMap").onclick=()=>setDeal("map");
$("tabOffer").onclick=()=>{state.role="offer";state.page=1;$("tabOffer").classList.add("active");$("tabRequest").classList.remove("active");render();updateMarkersSafe();};
$("tabRequest").onclick=()=>{state.role="request";state.page=1;$("tabRequest").classList.add("active");$("tabOffer").classList.remove("active");render();updateMarkersSafe();};
document.querySelectorAll(".seg-btn").forEach(b=>b.onclick=()=>{state.rentCat=state.rentCat===b.dataset.cat?"":b.dataset.cat;state.page=1;render();});
$("favHeaderBtn").onclick=()=>{switchView("fav");syncDealTabs();};
$("profileBtn").onclick=()=>{switchView("profile");syncDealTabs();};
$("logoBtn").onclick=e=>{e.preventDefault();switchView("list");syncDealTabs();};
$("detailClose").onclick=()=>$("detailModal").classList.add("hidden");
$("detailModal").addEventListener("click",e=>{if(e.target.id==="detailModal")$("detailModal").classList.add("hidden");});
$("filtersModalBtn").onclick=()=>{const bar=$("filtersBar");if(window.innerWidth<768){bar.style.display=bar.style.display==="flex"?"":"flex";bar.classList.add("open");}else{$("filtersModal").classList.remove("hidden");}};
$("filtersClose").onclick=()=>$("filtersModal").classList.add("hidden");
$("filtersModalApply").onclick=()=>{$("filtersModal").classList.add("hidden");$("applyBtn").click();};
$("langSelect").onchange=e=>{state.lang=e.target.value;document.documentElement.lang=state.lang;render();};
$("currencySelect").onchange=e=>{state.currency=e.target.value;render();};
$("themeBtn").onclick=()=>{const r=document.documentElement;const dark=r.dataset.theme==="dark";r.dataset.theme=dark?"":"dark";$("themeBtn").textContent=dark?"○":"●";};
$("creditClose").onclick=()=>$("creditModal").classList.add("hidden");
$("creditModal").addEventListener("click",e=>{if(e.target.id==="creditModal")$("creditModal").classList.add("hidden");});
$("simCalc").onclick=calcCredit;
["simPrice","simDP","simRate","simYears"].forEach(id=>$(id).addEventListener("input",calcCredit));
render();syncDealTabs();highlightQuick();
