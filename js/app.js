/* RentHome Bali v2 — deal tabs + extended filters + characteristics */
const RATE = 16000;
const now = Date.now();
const H = 3600e3, M = 60e3;
const LISTINGS = [
{id:1,type:"offer",dealType:"rent",category:"monthly",title:"Вилла с бассейном в Чангу",price:25000000,currency:"IDR",propertyType:"villa",bedrooms:3,bathrooms:2,area:180,landArea:250,floors:2,yearBuilt:2021,furnished:true,parking:1,location:"Чангу",locationEn:"Canggu",lat:-8.6478,lng:115.1385,images:[1,2,3].map(i=>`https://picsum.photos/seed/bali1-${i}/640/360`),createdAt:now-4*M,isVerified:true,isAgent:true,agentName:"Иван",isTop:true,isUrgent:false,legal:true,rating:4.8,reviews:46,views:1240,mine:true},
{id:2,type:"offer",dealType:"rent",category:"monthly",title:"Квартира 1BR в Семиньяке",price:7500000,currency:"IDR",propertyType:"apartment",bedrooms:1,bathrooms:1,area:35,landArea:0,floors:5,yearBuilt:2022,furnished:true,parking:0,location:"Семиньяк",locationEn:"Seminyak",lat:-8.6905,lng:115.1665,images:[1,2].map(i=>`https://picsum.photos/seed/bali2-${i}/640/360`),createdAt:now-4*M,isVerified:true,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.6,reviews:46,views:860,mine:false},
{id:3,type:"offer",dealType:"rent",category:"monthly",title:"Дом 2 спальни в Убуде",price:12000000,currency:"IDR",propertyType:"house",bedrooms:2,bathrooms:2,area:95,landArea:150,floors:1,yearBuilt:2019,furnished:true,parking:1,location:"Убуд",locationEn:"Ubud",lat:-8.5069,lng:115.2625,images:[1,2,3,4].map(i=>`https://picsum.photos/seed/bali3-${i}/640/360`),createdAt:now-2*H,isVerified:false,isAgent:true,agentName:"Made",isTop:false,isUrgent:true,legal:true,rating:4.9,reviews:21,views:540,mine:false},
{id:4,type:"offer",dealType:"rent",category:"monthly",title:"Sewa Kos в Улувату у океана",price:3500000,currency:"IDR",propertyType:"boarding",bedrooms:1,bathrooms:1,area:20,landArea:0,floors:2,yearBuilt:2020,furnished:true,parking:0,location:"Улувату",locationEn:"Uluwatu",lat:-8.8150,lng:115.1725,images:[`https://picsum.photos/seed/bali4-1/640/360`],createdAt:now-26*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.2,reviews:8,views:210,mine:false},
{id:5,type:"offer",dealType:"rent",category:"yearly",title:"Таунхаус в Сануре (год)",price:180000000,currency:"IDR",propertyType:"townhouse",bedrooms:3,bathrooms:2,area:120,landArea:110,floors:2,yearBuilt:2021,furnished:false,parking:1,location:"Санур",locationEn:"Sanur",lat:-8.6930,lng:115.2628,images:[1,2,3].map(i=>`https://picsum.photos/seed/bali5-${i}/640/360`),createdAt:now-5*H,isVerified:true,isAgent:false,isTop:true,isUrgent:false,legal:true,rating:4.7,reviews:33,views:980,mine:true},
{id:6,type:"offer",dealType:"rent",category:"monthly",title:"Вилла в Нуса-Дуа",price:45000000,currency:"IDR",propertyType:"villa",bedrooms:4,bathrooms:3,area:250,landArea:400,floors:2,yearBuilt:2023,furnished:true,parking:2,location:"Нуса-Дуа",locationEn:"Nusa Dua",lat:-8.7962,lng:115.2229,images:[1,2].map(i=>`https://picsum.photos/seed/bali6-${i}/640/360`),createdAt:now-50*M,isVerified:true,isAgent:true,agentName:"Ketut",isTop:false,isUrgent:false,legal:true,rating:5.0,reviews:12,views:430,mine:false},
{id:7,type:"offer",dealType:"rent",category:"monthly",title:"Дом в Денпасаре для семьи",price:9000000,currency:"IDR",propertyType:"house",bedrooms:3,bathrooms:1,area:110,landArea:140,floors:1,yearBuilt:2018,furnished:false,parking:1,location:"Денпасар",locationEn:"Denpasar",lat:-8.6705,lng:115.2126,images:[1,2,3].map(i=>`https://picsum.photos/seed/bali7-${i}/640/360`),createdAt:now-3*24*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.3,reviews:15,views:300,mine:false},
{id:8,type:"offer",dealType:"rent",category:"monthly",title:"Пентхаус в Семиньяке",price:30000000,currency:"IDR",propertyType:"apartment",bedrooms:2,bathrooms:2,area:85,landArea:0,floors:8,yearBuilt:2022,furnished:true,parking:1,location:"Семиньяк",locationEn:"Seminyak",lat:-8.6871,lng:115.1674,images:[1,2,3].map(i=>`https://picsum.photos/seed/bali8-${i}/640/360`),createdAt:now-10*H,isVerified:true,isAgent:true,agentName:"Anna",isTop:true,isUrgent:false,legal:true,rating:4.9,reviews:58,views:2100,mine:false},
{id:9,type:"offer",dealType:"rent",category:"yearly",title:"Вилла в Джимбаране (год)",price:240000000,currency:"IDR",propertyType:"villa",bedrooms:5,bathrooms:4,area:300,landArea:500,floors:3,yearBuilt:2020,furnished:true,parking:2,location:"Джимбаран",locationEn:"Jimbaran",lat:-8.7775,lng:115.1637,images:[1,2].map(i=>`https://picsum.photos/seed/bali9-${i}/640/360`),createdAt:now-30*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.5,reviews:19,views:670,mine:false},
{id:10,type:"offer",dealType:"rent",category:"monthly",title:"Студия в Чангу",price:6000000,currency:"IDR",propertyType:"apartment",bedrooms:1,bathrooms:1,area:28,landArea:0,floors:3,yearBuilt:2023,furnished:true,parking:0,location:"Чангу",locationEn:"Canggu",lat:-8.6499,lng:115.1339,images:[1,2].map(i=>`https://picsum.photos/seed/bali10-${i}/640/360`),createdAt:now-20*M,isVerified:false,isAgent:false,isTop:false,isUrgent:true,legal:false,rating:4.4,reviews:9,views:390,mine:false},
{id:17,type:"offer",dealType:"sale",title:"Вилла с бассейном в Убуде — продажа",price:4500000000,currency:"IDR",propertyType:"villa",bedrooms:3,bathrooms:3,area:200,landArea:300,floors:2,yearBuilt:2021,furnished:true,parking:2,location:"Убуд",locationEn:"Ubud",lat:-8.5120,lng:115.2700,images:[1,2,3].map(i=>`https://picsum.photos/seed/sale17-${i}/640/360`),createdAt:now-6*H,isVerified:true,isAgent:true,agentName:"Wayan",isTop:true,isUrgent:false,legal:true,rating:4.9,reviews:27,views:1500,mine:true},
{id:18,type:"offer",dealType:"sale",title:"Земля 10 соток в Улувату",price:2800000000,currency:"IDR",propertyType:"land",bedrooms:0,bathrooms:0,area:0,landArea:1000,floors:0,yearBuilt:0,furnished:false,parking:0,location:"Улувату",locationEn:"Uluwatu",lat:-8.8200,lng:115.1750,images:[1,2].map(i=>`https://picsum.photos/seed/sale18-${i}/640/360`),createdAt:now-14*H,isVerified:true,isAgent:false,isTop:false,isUrgent:false,legal:true,rating:4.7,reviews:11,views:620,mine:false},
{id:19,type:"offer",dealType:"sale",title:"Коммерческое помещение в Куте",price:5200000000,currency:"IDR",propertyType:"commercial",bedrooms:0,bathrooms:2,area:150,landArea:120,floors:2,yearBuilt:2019,furnished:false,parking:3,location:"Кута",locationEn:"Kuta",lat:-8.7184,lng:115.1686,images:[1,2].map(i=>`https://picsum.photos/seed/sale19-${i}/640/360`),createdAt:now-2*24*H,isVerified:false,isAgent:true,agentName:"Made",isTop:false,isUrgent:false,legal:true,rating:4.5,reviews:7,views:410,mine:false},
{id:20,type:"offer",dealType:"sale",title:"Квартира 2BR в Денпасаре",price:1800000000,currency:"IDR",propertyType:"apartment",bedrooms:2,bathrooms:1,area:60,landArea:0,floors:10,yearBuilt:2022,furnished:true,parking:1,location:"Денпасар",locationEn:"Denpasar",lat:-8.6720,lng:115.2150,images:[1,2].map(i=>`https://picsum.photos/seed/sale20-${i}/640/360`),createdAt:now-1*H,isVerified:true,isAgent:false,isTop:false,isUrgent:true,legal:false,rating:4.6,reviews:14,views:530,mine:false},
{id:11,type:"request",dealType:"rent",category:"monthly",title:"Сниму 1BR в Чангу до 8 млн",price:8000000,currency:"IDR",propertyType:"apartment",bedrooms:1,bathrooms:1,area:30,landArea:0,floors:0,yearBuilt:0,furnished:true,parking:0,location:"Чангу",locationEn:"Canggu",lat:-8.6500,lng:115.1400,images:[`https://picsum.photos/seed/req11/640/360`],createdAt:now-40*M,isVerified:true,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:0,reviews:3,views:120,moveIn:"2026-10-01"},
{id:12,type:"request",dealType:"sale",title:"Куплю виллу в Улувату",price:3500000000,currency:"IDR",propertyType:"villa",bedrooms:3,bathrooms:2,area:200,landArea:250,floors:2,yearBuilt:0,furnished:false,parking:0,location:"Улувату",locationEn:"Uluwatu",lat:-8.8100,lng:115.1700,images:[`https://picsum.photos/seed/req12/640/360`],createdAt:now-3*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:0,reviews:1,views:80,moveIn:"2026-11-15"},
{id:13,type:"request",dealType:"rent",category:"monthly",title:"Сниму дом в Убуде на 3 мес",price:10000000,currency:"IDR",propertyType:"house",bedrooms:2,bathrooms:1,area:80,landArea:100,floors:1,yearBuilt:0,furnished:true,parking:0,location:"Убуд",locationEn:"Ubud",lat:-8.5100,lng:115.2600,images:[`https://picsum.photos/seed/req13/640/360`],createdAt:now-12*H,isVerified:true,isAgent:false,isTop:true,isUrgent:false,legal:false,rating:0,reviews:5,views:230,moveIn:"2026-09-20"},
{id:14,type:"request",dealType:"rent",category:"monthly",title:"Ищу sewa kos в Семиньяке",price:4000000,currency:"IDR",propertyType:"boarding",bedrooms:1,bathrooms:1,area:18,landArea:0,floors:0,yearBuilt:0,furnished:true,parking:0,location:"Семиньяк",locationEn:"Seminyak",lat:-8.6900,lng:115.1650,images:[`https://picsum.photos/seed/req14/640/360`],createdAt:now-8*H,isVerified:false,isAgent:false,isTop:false,isUrgent:true,legal:false,rating:0,reviews:2,views:150,moveIn:"2026-09-10"},
{id:15,type:"request",dealType:"rent",category:"yearly",title:"Сниму таунхаус в Сануре на год",price:150000000,currency:"IDR",propertyType:"townhouse",bedrooms:3,bathrooms:2,area:110,landArea:100,floors:2,yearBuilt:0,furnished:false,parking:1,location:"Санур",locationEn:"Sanur",lat:-8.6950,lng:115.2600,images:[`https://picsum.photos/seed/req15/640/360`],createdAt:now-2*24*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:0,reviews:0,views:60,moveIn:"2026-10-10"},
{id:16,type:"request",dealType:"sale",title:"Куплю квартиру в Денпасаре",price:1200000000,currency:"IDR",propertyType:"apartment",bedrooms:2,bathrooms:1,area:60,landArea:0,floors:0,yearBuilt:0,furnished:false,parking:0,location:"Денпасар",locationEn:"Denpasar",lat:-8.6710,lng:115.2100,images:[`https://picsum.photos/seed/req16/640/360`],createdAt:now-30*M,isVerified:true,isAgent:true,agentName:"Wayan",isTop:false,isUrgent:false,legal:true,rating:0,reviews:4,views:190,moveIn:"2026-12-01"},
{id:21,type:"offer",dealType:"rent",category:"yearly",title:"Земля в аренду в Табанане — 25 лет",price:85000000,currency:"IDR",propertyType:"land",bedrooms:0,bathrooms:0,area:0,landArea:800,floors:0,yearBuilt:0,furnished:false,parking:0,location:"Табанан",locationEn:"Tabanan",lat:-8.5416,lng:115.1247,images:[1,2].map(i=>`https://picsum.photos/seed/land21-${i}/640/360`),createdAt:now-3*H,isVerified:true,isAgent:false,isTop:false,isUrgent:false,legal:true,rating:4.6,reviews:6,views:320,mine:false},
{id:22,type:"offer",dealType:"rent",category:"monthly",title:"Участок под глэмпинг в Убуде",price:7000000,currency:"IDR",propertyType:"land",bedrooms:0,bathrooms:0,area:0,landArea:500,floors:0,yearBuilt:0,furnished:false,parking:0,location:"Убуд",locationEn:"Ubud",lat:-8.5200,lng:115.2700,images:[`https://picsum.photos/seed/land22-1/640/360`],createdAt:now-7*H,isVerified:false,isAgent:true,agentName:"Ketut",isTop:false,isUrgent:true,legal:false,rating:4.4,reviews:4,views:180,mine:false},
{id:23,type:"offer",dealType:"rent",category:"monthly",title:"Homestay в Чангу с завтраками",price:5500000,currency:"IDR",propertyType:"homestay",bedrooms:1,bathrooms:1,area:24,landArea:0,floors:2,yearBuilt:2021,furnished:true,parking:0,location:"Чангу",locationEn:"Canggu",lat:-8.6550,lng:115.1450,images:[1,2,3].map(i=>`https://picsum.photos/seed/home23-${i}/640/360`),createdAt:now-90*M,isVerified:true,isAgent:false,isTop:true,isUrgent:false,legal:false,rating:4.9,reviews:64,views:1120,mine:false},
{id:24,type:"offer",dealType:"rent",category:"monthly",title:"Homestay в Убуде — тихо и зелено",price:4200000,currency:"IDR",propertyType:"homestay",bedrooms:1,bathrooms:1,area:22,landArea:0,floors:1,yearBuilt:2020,furnished:true,parking:0,location:"Убуд",locationEn:"Ubud",lat:-8.5150,lng:115.2550,images:[1,2].map(i=>`https://picsum.photos/seed/home24-${i}/640/360`),createdAt:now-11*H,isVerified:false,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.7,reviews:31,views:540,mine:false},
{id:25,type:"offer",dealType:"rent",category:"monthly",title:"Homestay в Переренане с бассейном",price:6800000,currency:"IDR",propertyType:"homestay",bedrooms:1,bathrooms:1,area:26,landArea:0,floors:2,yearBuilt:2022,furnished:true,parking:0,location:"Переренан",locationEn:"Pererenan",lat:-8.6570,lng:115.1280,images:[`https://picsum.photos/seed/home25-1/640/360`],createdAt:now-5*H,isVerified:true,isAgent:false,isTop:false,isUrgent:false,legal:false,rating:4.8,reviews:19,views:410,mine:false},
{id:26,type:"offer",dealType:"rent",category:"monthly",title:"Апартаменты в Легиане у пляжа",price:8200000,currency:"IDR",propertyType:"apartment",bedrooms:1,bathrooms:1,area:32,landArea:0,floors:4,yearBuilt:2021,furnished:true,parking:0,location:"Легиан",locationEn:"Legian",lat:-8.7060,lng:115.1680,images:[1,2].map(i=>`https://picsum.photos/seed/apt26-${i}/640/360`),createdAt:now-9*H,isVerified:false,isAgent:true,agentName:"Made",isTop:false,isUrgent:false,legal:true,rating:4.5,reviews:12,views:360,mine:false},
];

const U=id=>`https://images.unsplash.com/${id}?w=640&q=70&auto=format&fit=crop`;
const POOL={
villa:[U("photo-1613490493576-7fde63acd811"),U("photo-1512917774080-9991f1c4c750"),U("photo-1600596542815-ffad4c1539a9"),U("photo-1584132967334-10e028bd69f7")],
house:[U("photo-1564013799919-ab600027ffc6d"),U("photo-1600585154340-be6161a56a0c"),U("photo-1580587771525-78b9dba3b914"),U("photo-1600047509807-ba8f99d2cdde")],
apartment:[U("photo-1522708323590-d24dbb6b0267"),U("photo-1560448204-e02f11c3d0e2"),U("photo-1493809842364-78817add7ffb")],
homestay:[U("photo-1595526114035-0d45ed16cfbf"),U("photo-1554995207-c18c203602cb"),U("photo-1571896349842-33c89424de2d")],
boarding:[U("photo-1595526114035-0d45ed16cfbf"),U("photo-1554995207-c18c203602cb")],
townhouse:[U("photo-1570129477492-45c003edd2be"),U("photo-1580587771525-78b9dba3b914"),U("photo-1600047509807-ba8f99d2cdde")],
land:[U("photo-1500382017468-9049fed747ef"),U("photo-1472214103451-9374bd1c798e")],
commercial:[U("photo-1486406146926-c627a92ad1ab"),U("photo-1564013799919-ab600027ffc6d")]};
LISTINGS.forEach((it,i)=>{const p=POOL[it.propertyType]||POOL.villa;const n=it.type==="request"?1:(it.propertyType==="land"?2:3);it.images=Array.from({length:n},(_,k)=>p[(i+k)%p.length]);it.fb=`https://picsum.photos/seed/bali${it.id}/640/360`;});
const AM={villa:["Бассейн","Wi-Fi","Кондиционер","Кухня","Парковка","Стиральная машина","Сад"],house:["Wi-Fi","Кондиционер","Кухня","Парковка","Стиральная машина","Сад","Телевизор"],apartment:["Wi-Fi","Кондиционер","Холодильник","Телевизор","Стиральная машина","Плита"],homestay:["Wi-Fi","Кондиционер","Завтраки","Холодильник","Телевизор"],boarding:["Wi-Fi","Кондиционер","Холодильник","Общая кухня"],townhouse:["Wi-Fi","Кондиционер","Парковка","Стиральная машина","Холодильник"],land:["Подъездная дорога","Электричество","Вода","Тихий район"],commercial:["Wi-Fi","Кондиционер","Парковка","Витрина","Склад"]};
LISTINGS.forEach((it,i)=>{const a=AM[it.propertyType]||AM.villa;it.amenities=a.slice(0,4+(i%3));});
const TEN={17:"freehold",18:"freehold",19:"leasehold",20:"freehold",12:"leasehold",16:"freehold"};
LISTINGS.forEach(it=>{if(it.dealType==="sale")it.tenure=TEN[it.id]||"freehold";});
LISTINGS.forEach(it=>{it.living=(it.propertyType==="land"||it.propertyType==="commercial")?0:(it.bedrooms>=4?2:(it.bedrooms>=2?1:0));});
const AVAIL={6:"2026-12-04",9:"2026-12-01",13:"2026-11-01",23:"2026-10-15"};
LISTINGS.forEach(it=>{it.available=AVAIL[it.id]||null;});
function fmtDate(iso){const[a,b,c]=iso.split("-");return`${c}.${b}.${a}`;}
let detailId=null,detailIdx=0;

const I18N = {
ru:{topbar:"Проверенные объекты Бали · прозрачная цена · русскоязычная поддержка",deal_buy:"Купить",deal_rent:"Арендовать",deal_map:"Карта",tab_offer:"Сдам / Продам",tab_request:"Сниму / Куплю",sub_hint:"предлагаю / ищу",price:"Цена",ptype:"Тип недвижимости",all:"Все",any:"Любой",any_area:"Вся Бали",bedrooms:"Спальни",district:"Локация",loc_any:"Любая локация",loc_clear:"Очистить",apply:"Показать",reset:"Сбросить",filters:"Фильтры",advanced:"Расширенный",rent_cat:"Срок",monthly:"мес",yearly:"год",land_area:"Участок, м²",build_area:"Строение, м²",floors:"Этажей",year:"Год от",furn:"Меблировка",yes:"Да",no:"Нет",parking:"Парковка",s_date:"Сначала новые",s_price_asc:"Дешевле",s_price_desc:"Дороже",s_pop:"Популярные",empty:"Ничего не найдено. Попробуйте сбросить фильтры.",fav_title:"Избранное",fav_empty:"Пока пусто. Нажмите ♡ на карточке, чтобы сохранить.",verified:"Проверено",owner:"Собственник",my_listings:"Мои объявления",nav_list:"Каталог",nav_map:"Карта",nav_fav:"Сохранённое",nav_profile:"Профиль",filters_hint:"Задайте значения и нажмите Показать.",variants:"вариантов",new:"New",top:"Топ",agent:"Агент",urgent:"Срочно",offer_btn:"Предложить вариант",legal_txt:"Юр. сопровождение",move_in:"Заезд",month:"/ мес",year_per:"/ год",total:"total",new_objects:"Новые объекты недвижимости",q_buy_house:"Купить дом",q_buy_land:"Купить землю",q_rent_house:"Арендовать дом",q_rent_land:"Аренда земли",q_homestay:"Homestay",q_rent_board:"Sewa Kos",q_sim:"Моделирование кредита",sim_hint:"Simulasi Kredit — прикиньте ежемесячный платёж.",sim_price:"Цена объекта",sim_dp:"Первый взнос, %",sim_rate:"Ставка, % годовых",sim_years:"Срок, лет",sim_go:"Рассчитать",map_hint:"Фильтры применяются к карте.",f_product:"Продукт",f_help:"Помощь",f_policy:"Право",home:"Главная",long_rent:"Аренда · помесячно",year_rent:"Аренда · на год",sale_h:"Покупка",offer_h:"Предлагаю",request_h:"Ищу",t_villa:"Вилла",t_house:"Дом",t_apartment:"Квартиры",t_homestay:"Homestay",t_land:"Земельные участки",t_commercial:"Коммерческая",t_townhouse:"Таунхаусы",t_boarding:"Sewa Kos",char_land:"Участок",char_house:"Дом",char_floors:"Эт.",char_bed:"сп.",char_bath:"ван.",char_year:""},
en:{topbar:"Verified Bali listings · transparent pricing · EN support",deal_buy:"Buy",deal_rent:"Rent",deal_map:"Map",tab_offer:"Offer",tab_request:"Wanted",sub_hint:"offer / wanted",price:"Price",ptype:"Property type",all:"All",any:"Any",any_area:"All Bali",bedrooms:"Bedrooms",district:"Location",loc_any:"Any",loc_clear:"Clear",apply:"Show",reset:"Reset",filters:"Filters",advanced:"Advanced",rent_cat:"Term",monthly:"mo",yearly:"yr",land_area:"Land, m²",build_area:"Building, m²",floors:"Floors",year:"Year from",furn:"Furnished",yes:"Yes",no:"No",parking:"Parking",s_date:"Newest",s_price_asc:"Cheapest",s_price_desc:"Priciest",s_pop:"Popular",empty:"Nothing found. Try resetting filters.",fav_title:"Favorites",fav_empty:"Empty yet. Tap ♡ on a card to save.",verified:"Verified",owner:"Owner",my_listings:"My listings",nav_list:"Catalog",nav_map:"Map",nav_fav:"Saved",nav_profile:"Profile",filters_hint:"Set values and press Show.",variants:"places",new:"New",top:"Top",agent:"Agent",urgent:"Urgent",offer_btn:"Propose option",legal_txt:"Legal support",move_in:"Move-in",month:"/ mo",year_per:"/ yr",total:"total",new_objects:"New properties",q_buy_house:"Buy house",q_buy_land:"Buy land",q_rent_house:"Rent house",q_rent_land:"Land lease",q_homestay:"Homestay",q_rent_board:"Sewa Kos",q_sim:"Credit simulation",sim_hint:"Simulasi Kredit — estimate your monthly payment.",sim_price:"Price",sim_dp:"Down payment, %",sim_rate:"Rate, % yearly",sim_years:"Term, years",sim_go:"Calculate",map_hint:"Filters apply to the map.",f_product:"Product",f_help:"Help",f_policy:"Legal",home:"Home",long_rent:"Rent · monthly",year_rent:"Rent · yearly",sale_h:"Sale",offer_h:"Offer",request_h:"Wanted",t_villa:"Villa",t_house:"House",t_apartment:"Apartments",t_homestay:"Homestay",t_land:"Land plots",t_commercial:"Commercial",t_townhouse:"Townhouses",t_boarding:"Sewa Kos",char_land:"Land",char_house:"House",char_floors:"fl.",char_bed:"bd",char_bath:"ba",char_year:""}
};

const state = {deal:"rent",role:"offer",rentCat:"monthly",tenure:"",query:"",view:"list",page:1,perPage:9,sort:"date_desc",lang:"ru",currency:"IDR",fav:new Set(JSON.parse(localStorage.getItem("rh_fav")||"[]")),carIdx:{},districts:new Set()};
const DIST_TREE=[
 {key:"Canggu",ru:"Чангу",kids:[["Berawa","Берава"],["BatuBolong","Бату Болонг"],["TumbakBayuh","Тумбак Баюх"]]},
 {key:"Pererenan",ru:"Переренан",kids:[]},
 {key:"Umalas",ru:"Умалас",kids:[]},
 {key:"Kerobokan",ru:"Керобокан",kids:[]},
 {key:"Seseh",ru:"Сесех",kids:[]},
 {key:"Buduk",ru:"Будук",kids:[]},
 {key:"Seminyak",ru:"Семиньяк",kids:[["BeachsideCenter","Beachside & center"],["ResidentialSide","Residential side"],["Oberoi","Oberoi"],["Legian","Legian"],["Petitenget","Petitenget"]]},
 {key:"Kuta",ru:"Кута",kids:[]},
 {key:"TanahLot",ru:"Танах Лот",kids:[["Kedungu","Кедунгу"],["Cemagi","Чемаги"]]},
 {key:"Uluwatu",ru:"Улувату",kids:[["Bingin","Бингин"],["Balangan","Балаган"]]},
 {key:"Jimbaran",ru:"Джимбаран",kids:[]},
 {key:"NusaDua",ru:"Нуса-Дуа",kids:[]},
 {key:"Ungasan",ru:"Унгасан",kids:[["Pecatu","Печату"]]},
 {key:"Ubud",ru:"Убуд",kids:[["Mas","Мас"],["Payangan","Паянган"]]},
 {key:"Denpasar",ru:"Денпасар",kids:[]},
 {key:"Sanur",ru:"Санур",kids:[]},
 {key:"Gianyar",ru:"Гианьяр",kids:[["Sukawati","Сукавати"]]},
 {key:"Tabanan",ru:"Табанан",kids:[["Mengwi","Менгви"]]},
 {key:"Lovina",ru:"Ловина",kids:[["Singaraja","Сингараджа"]]},
 {key:"Pemuteran",ru:"Пемутеран",kids:[]},
 {key:"Amed",ru:"Амед",kids:[["Candidasa","Кандидаса"]]},
 {key:"Sidemen",ru:"Сидемен",kids:[]},
 {key:"NusaPenida",ru:"Нуса-Пенида",kids:[["NusaLembongan","Нуса-Лембонган"]]}
];
let locNoRebuild=false;
function paintIndeterminate(){
  const dd=$("locDropdown");if(!dd)return;
  dd.querySelectorAll("[data-parent]").forEach(p=>{
    const node=DIST_TREE.find(n=>n.key===p.dataset.parent);
    const ks=((node||{}).kids||[]).map(([k])=>k);
    p.indeterminate=!!(ks.length&&ks.some(k=>state.districts.has(k))&&!ks.every(k=>state.districts.has(k)));
    p.checked=state.districts.has(p.dataset.parent);
  });
  dd.querySelectorAll("[data-dist]:not([data-parent])").forEach(cb=>{cb.checked=state.districts.has(cb.dataset.dist);});
}
state.locOpen=new Set(["Canggu","Seminyak"]);
const PARENT={};DIST_TREE.forEach(n=>(n.kids||[]).forEach(([k])=>PARENT[k]=n.key));
function locName(key){for(const n of DIST_TREE){if(n.key===key)return state.lang==="ru"?n.ru:n.key;for(const [k,r] of (n.kids||[]))if(k===key)return r;}return key;}
function renderLocDropdown(){
  const dd=$("locDropdown");if(!dd)return;
  dd.innerHTML=DIST_TREE.map(n=>{
    const kids=n.kids||[];
    const kidHtml=kids.length?`<div class="loc-kids${state.locOpen.has(n.key)?" open":""}" data-kids="${n.key}"><div class="loc-kids-in">${kids.map(([k,r])=>`<label class="location-item kid"><input type="checkbox" data-dist="${k}"${state.districts.has(k)?" checked":""}> ${state.lang==="ru"?r:k}</label>`).join("")}</div></div>`:"";
    return`<div class="loc-node"><div class="loc-row"><button type="button" class="loc-exp${kids.length?"":" novis"}${state.locOpen.has(n.key)?" open":""}" data-exp="${n.key}" tabindex="-1">›</button><label class="location-item"><input type="checkbox" data-dist="${n.key}" data-parent="${n.key}"${state.districts.has(n.key)?" checked":""}> ${state.lang==="ru"?n.ru:n.key}</label></div>${kidHtml}</div>`;
  }).join("")+`<div class="loc-foot"><button class="loc-clear" id="locClear">${t("loc_clear")}</button></div>`;
  dd.querySelectorAll("[data-exp]").forEach(b=>b.onclick=e=>{e.stopPropagation();state.locOpen.has(b.dataset.exp)?state.locOpen.delete(b.dataset.exp):state.locOpen.add(b.dataset.exp);renderLocDropdown();});
  dd.querySelectorAll("[data-dist]").forEach(cb=>cb.onchange=()=>{
    const node=DIST_TREE.find(n=>n.key===cb.dataset.dist);
    if(node&&(node.kids||[]).length)node.kids.forEach(([k])=>cb.checked?state.districts.add(k):state.districts.delete(k));
    cb.checked?state.districts.add(cb.dataset.dist):state.districts.delete(cb.dataset.dist);
    state.page=1;locNoRebuild=true;updateLocLabel();render();paintIndeterminate();updateMarkersSafe();
  });
  dd.querySelectorAll("[data-parent]").forEach(p=>{
    const node=DIST_TREE.find(n=>n.key===p.dataset.parent);
    const ks=(node.kids||[]).map(([k])=>k);
    if(ks.length&&ks.some(k=>state.districts.has(k))&&!ks.every(k=>state.districts.has(k)))p.indeterminate=true;
  });
  $("locClear").onclick=e=>{e.stopPropagation();state.districts.clear();state.page=1;renderLocDropdown();updateLocLabel();render();updateMarkersSafe();};
}
function updateLocLabel(){
  const s=[...state.districts],el=$("locSelected");if(!el)return;
  el.textContent=s.length===0?t("loc_any"):s.length===1?locName(s[0]):`${locName(s[0])} +${s.length-1}`;
}
function toggleLoc(force){
  const w=$("locFilter"),open=force!==undefined?force:!w.classList.contains("open");
  w.classList.toggle("open",open);$("locHeader").setAttribute("aria-expanded",open);
}
/* custom dropdowns instead of native popups */
const DDREG=[];
function closeAllDD(){document.querySelectorAll(".dd.open").forEach(d=>d.classList.remove("open"));}
function ddShell(el){
  const wrap=document.createElement("div");wrap.className="dd";
  el.parentNode.insertBefore(wrap,el);wrap.appendChild(el);el.style.display="none";
  const btn=document.createElement("button");btn.type="button";btn.className="dd-btn";
  btn.innerHTML=`<span class="dd-val"></span><span class="chev">▼</span>`;
  const panel=document.createElement("div");panel.className="dd-panel";
  wrap.append(btn,panel);
  btn.onclick=e=>{e.stopPropagation();const was=wrap.classList.contains("open");closeAllDD();wrap.classList.toggle("open",!was);};
  return{wrap,btn,panel};
}
function enhanceSelect(sel){
  const{btn,panel}=ddShell(sel);
  function paint(){
    panel.innerHTML="";
    [...sel.options].forEach(o=>{
      const b=document.createElement("button");b.type="button";b.className="dd-opt"+(o.value===sel.value?" on":"");b.textContent=o.textContent;
      b.onclick=e=>{e.stopPropagation();if(sel.value!==o.value){sel.value=o.value;sel.dispatchEvent(new Event("change"));}paint();closeAllDD();};
      panel.append(b);
    });
    btn.querySelector(".dd-val").textContent=sel.options[sel.selectedIndex]?sel.options[sel.selectedIndex].textContent:"—";
  }
  DDREG.push({sync:paint});paint();
}
const MONTHS=["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
function enhanceMonth(input){
  const{btn,panel}=ddShell(input);
  let year=2026;
  function paint(){
    if(input.value)year=+input.value.slice(0,4);
    panel.innerHTML=`<div class="dd-year"><button type="button" data-y="-1">‹</button><span>${year}</span><button type="button" data-y="1">›</button></div><div class="dd-months">${MONTHS.map((m,i)=>{const v=`${year}-${String(i+1).padStart(2,"0")}`;return`<button type="button" data-m="${v}" class="${input.value===v?"on":""}">${m}</button>`;}).join("")}</div><div class="loc-foot"><button type="button" class="loc-clear">Очистить</button></div>`;
    panel.querySelectorAll("[data-y]").forEach(b=>b.onclick=e=>{e.stopPropagation();year+=+b.dataset.y;paint();});
    panel.querySelectorAll("[data-m]").forEach(b=>b.onclick=e=>{e.stopPropagation();input.value=b.dataset.m;paint();closeAllDD();});
    panel.querySelector(".loc-clear").onclick=e=>{e.stopPropagation();input.value="";paint();closeAllDD();};
    btn.querySelector(".dd-val").textContent=input.value?`${MONTHS[+input.value.slice(5)-1]} ${year}`:"Выберите";
  }
  DDREG.push({sync:paint});paint();
}
function syncDropdowns(){DDREG.forEach(r=>r.sync());}
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
const SVG_PIN='<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const SVG_EYE='<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
const SVG_BED='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 20v-9a2 2 0 012-2h16a2 2 0 012 2v9"/><path d="M2 17h20"/><circle cx="6" cy="11" r="1.6"/></svg>';
const SVG_BATH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 13h16v2a5 5 0 01-5 5H9a5 5 0 01-5-5v-2z"/><path d="M6 13V6a2 2 0 014 0"/><path d="M8 20l-1 2M16 20l1 2"/></svg>';
const SVG_AREA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg>';
const SVG_POOL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 3v10M17 3v10M7 7h10M7 11h10"/><path d="M2 17c2 0 2-1.2 4-1.2s2 1.2 4 1.2 2-1.2 4-1.2 2 1.2 4 1.2 2-1.2 4-1.2"/><path d="M2 21h20"/></svg>';
const SVG_SHIELD='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>';
const SVG_CUP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4h10v5a5 5 0 01-10 0V4z"/><path d="M7 5H4a3 3 0 003 5M17 5h3a3 3 0 01-3 5M12 14v4M8 21h8"/></svg>';
function plural(n,f){n=Math.abs(n)%100;const d=n%10;if(n>10&&n<20)return f[2];if(d>1&&d<5)return f[1];if(d===1)return f[0];return f[2];}

function cardHTML(it,i){
  i=i||0;
  const idx=state.carIdx[it.id]||0;
  const fav=state.fav.has(it.id);
  const heart=fav?"♥":"♡";
  let badges="";
  if(it.dealType==="sale"&&it.tenure)badges+=`<span class="badge tenure">${it.tenure==="freehold"?"Hak Milik":"Hak Sewa"}</span>`;
  if(it.isVerified)badges+=`<span class="badge verified">${SVG_SHIELD} ${t("verified")}</span>`;
  if(it.isTop)badges+=`<span class="badge top">${SVG_CUP} ${t("top")}</span>`;
  if(isNew(it))badges+=`<span class="badge new">★ ${t("new")}</span>`;
  if(it.isAgent)badges+=`<span class="badge agent">${t("agent")}${it.agentName?" · "+it.agentName:""}</span>`;
  if(it.isUrgent)badges+=`<span class="badge urgent">${t("urgent")}</span>`;
  const areaV=it.area>0?it.area:it.landArea;
  const sub=it.propertyType==="land"?`Участок ${it.landArea} м²`:(it.amenities||[]).slice(0,3).join(" · ");
  const am=(it.amenities||[]).concat(["—","—"]);
  const agent=it.isAgent&&it.agentName?it.agentName:(state.lang==="ru"?"Собственник":"Owner");
  const specs=`<div class="specs">
    <div class="spec">${SVG_BED}<b>${it.bedrooms||"—"}</b><span>${plural(it.bedrooms||0,["спальня","спальни","спален"])}</span></div>
    <div class="spec">${SVG_BATH}<b>${it.bathrooms||"—"}</b><span>${plural(it.bathrooms||0,["ванная","ванные","ванных"])}</span></div>
    <div class="spec">${SVG_AREA}<b>${areaV||"—"}${areaV?" м²":""}</b><span>площадь</span></div>
    <div class="spec">${SVG_POOL}<b>${am[0]}</b><span>${am[1]}</span></div></div>`;
  const agentRow=it.type==="request"?"":`<div class="agent-row"><div class="who"><b>${it.isAgent?"Агент "+agent:agent}</b><small>На связи · 10:00–20:00</small></div><button class="btn-ghost sm" data-contact="${it.id}">Связаться</button></div>`;
  const extra=it.type==="request"?`<button class="offer-btn" data-offer="${it.id}">${t("offer_btn")}</button>`:"";
  return `<div class="property-card" data-card="${it.id}" style="animation-delay:${Math.min(i,8)*45}ms">
    <div class="card-image"><img loading="lazy" decoding="async" src="${it.images[idx%it.images.length]}" onerror="this.onerror=null;this.src='${it.fb}'" alt="Фото объекта">
      ${it.images.length>1?`<button class="car-btn prev" data-car="prev" data-id="${it.id}" aria-label="prev">‹</button><button class="car-btn next" data-car="next" data-id="${it.id}" aria-label="next">›</button>`:""}
      <span class="photo-counter">${(idx%it.images.length)+1}/${it.images.length}</span>
      <div class="badges">${badges}</div>
      <button class="favorite-btn ${fav?"active":""}" data-fav="${it.id}" aria-label="fav">${heart}</button>
      ${it.bedrooms>0?`<span class="bed-badge">${SVG_BED} ${it.bedrooms}</span>`:""}
      <div class="photo-titles"><div class="pt-title">${it.title||pTypeLabel(it.propertyType)}</div>${sub?`<div class="pt-sub">${sub}</div>`:""}</div></div>
    <div class="card-body"><div class="price">${fmtPrice(it)}</div>
      <div class="location-sm">${locLabel(it)}, Бали</div>
      ${specs}
      ${agentRow}
      ${extra}</div></div>`;
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
  const fT=gv("fType"),fR=gv("fRooms");
  const fFl=gv("fFloors"),fY=parseFloat(gv("fYear")),fFu=gv("furnQ"),fP=gv("fPark");
  const fAv=gv("fAvail"),fLv=gv("fLiving"),fAm=gv("fAmen");
  if(state.deal==="rent"&&state.rentCat)arr=arr.filter(x=>x.category===state.rentCat);
  if(state.deal==="sale"&&state.tenure)arr=arr.filter(x=>x.tenure===state.tenure);
  if(!isNaN(pMin))arr=arr.filter(x=>x.price>=pMin);
  if(!isNaN(pMax))arr=arr.filter(x=>x.price<=pMax);
  if(fT)arr=arr.filter(x=>x.propertyType===fT);
  if(fR)arr=arr.filter(x=>fR==="5"?x.bedrooms>=5:x.bedrooms==+fR);
  if(state.districts.size)arr=arr.filter(x=>{const a=x.locationEn||x.location;return [...state.districts].some(d=>d===a||PARENT[d]===a);});
  if(!isNaN(lMin))arr=arr.filter(x=>(x.landArea||0)>=lMin);
  if(!isNaN(lMax))arr=arr.filter(x=>(x.landArea||0)<=lMax);
  if(!isNaN(aMin))arr=arr.filter(x=>(x.area||0)>=aMin);
  if(!isNaN(aMax))arr=arr.filter(x=>(x.area||0)<=aMax);
  if(fFl)arr=arr.filter(x=>fFl==="5"?(x.floors||0)>=5:(x.floors||0)==+fFl);
  if(!isNaN(fY))arr=arr.filter(x=>(x.yearBuilt||0)>=fY);
  if(fFu==="yes")arr=arr.filter(x=>x.furnished);
  if(fFu==="no")arr=arr.filter(x=>!x.furnished);
  if(fAv)arr=arr.filter(x=>!x.available||x.available.slice(0,7)<=fAv);
  if(fLv)arr=arr.filter(x=>fLv==="2"?(x.living||0)>=2:(x.living||0)===1);
  if(fAm)arr=arr.filter(x=>(x.amenities||[]).includes(fAm));
  const q=(state.query||"").trim().toLowerCase();
  if(q){
    if(/^\d+$/.test(q)){const n=+q;const lim=n<100000?n*1000000:n;arr=arr.filter(x=>x.price<=lim);}
    else arr=arr.filter(x=>(x.title+" "+x.location+" "+(x.locationEn||"")).toLowerCase().includes(q));
  }
  if(fP)arr=arr.filter(x=>(x.parking||0)>=+fP);
  if(state.sort==="price_asc")arr.sort((a,b)=>a.price-b.price);
  else if(state.sort==="price_desc")arr.sort((a,b)=>b.price-a.price);
  else if(state.sort==="popular")arr.sort((a,b)=>b.views-a.views);
  else if(state.sort==="avail")arr.sort((a,b)=>(a.available||"")<(b.available||"")?-1:(a.available||"")>(b.available||"")?1:b.createdAt-a.createdAt);
  else arr.sort((a,b)=>b.createdAt-a.createdAt);
  return arr;
}

function renderCrumbs(){
  const dealName=state.deal==="sale"?t("sale_h"):(state.rentCat==="yearly"?t("year_rent"):t("long_rent"));
  const roleName=state.role==="offer"?t("offer_h"):t("request_h");
  const typeName=$("fType").value?pTypeLabel($("fType").value):"—";
  const ds=[...state.districts].map(locName);
  const distName=ds.length===0?"—":ds.length<=2?ds.join(", "):`${ds[0]} +${ds.length-1}`;
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
  if($("tenureWrap"))$("tenureWrap").style.display=state.deal==="sale"?"":"none";
  if($("availWrap"))$("availWrap").style.display=state.deal==="rent"?"":"none";
  document.querySelectorAll(".seg-btn").forEach(b=>b.classList.toggle("active",b.dataset.cat===state.rentCat||(b.dataset.tenure&&b.dataset.tenure===state.tenure)));
  renderCrumbs();if(locNoRebuild){locNoRebuild=false;}else{renderLocDropdown();}updateLocLabel();syncDropdowns();
  const fc=$("fcount");if(fc){const n=countActiveFilters();fc.textContent=n;fc.classList.toggle("hidden",n===0);}
  document.querySelectorAll("[data-mdeal]").forEach(b=>b.classList.toggle("active",(b.dataset.mdeal==="rent")===(state.deal==="rent")));
  document.querySelectorAll("[data-mtype]").forEach(b=>b.classList.toggle("active",$("fType").value===b.dataset.mtype));
  const arr=getFiltered();
  $("resultsCount").textContent=`${arr.length} ${t("variants")}`;
  if($("statCount"))$("statCount").textContent=LISTINGS.length;
  if($("heroTitle"))$("heroTitle").textContent=state.lang==="ru"?"Недвижимость на Бали без лишнего шума":"Bali property with no hassle";
  if($("advBtn"))$("advBtn").textContent=t("advanced")+($("advPanel").classList.contains("hidden")?"  +":"  –");
  const pages=Math.max(1,Math.ceil(arr.length/state.perPage));
  if(state.page>pages)state.page=pages;
  const slice=arr.slice((state.page-1)*state.perPage,state.page*state.perPage);
  $("cardsGrid").innerHTML=slice.map((it,i)=>cardHTML(it,i)).join("");
  $("emptyState").classList.toggle("hidden",slice.length>0);
  $("pagination").innerHTML=Array.from({length:pages},(_,i)=>`<button class="${state.page===i+1?"active":""}" data-page="${i+1}">${i+1}</button>`).join("");
  const favs=LISTINGS.filter(x=>state.fav.has(x.id));
  $("favGrid").innerHTML=favs.map(cardHTML).join("");
  $("favEmpty").style.display=favs.length?"none":"block";
  $("myGrid").innerHTML=LISTINGS.filter(x=>x.mine).map(cardHTML).join("");
  $("mapList").innerHTML=arr.slice(0,20).map(x=>`<div class="map-mini" data-card="${x.id}"><b>${fmtPrice(x)}</b> · ${pTypeLabel(x.propertyType)}<br>${locLabel(x)}</div>`).join("");
}

function switchView(v){
  state.view=v;
  ["list","map","fav","profile","detail"].forEach(k=>$("view-"+k).classList.toggle("hidden",k!==v));
  document.querySelectorAll(".bn-item").forEach(b=>b.classList.toggle("active",b.dataset.view===v));
  if(v==="map")setTimeout(initMap,50);
}
function setDeal(d){
  if(d==="map"){switchView("map");syncDealTabs();return;}
  state.deal=d;state.page=1;switchView("list");syncDealTabs();render();updateMarkersSafe();
}
function syncDealTabs(){
  document.querySelectorAll("[data-deal]").forEach(b=>{
    const d=b.dataset.deal;
    b.classList.toggle("active",d==="map"?state.view==="map":(state.deal===d&&state.view!=="map"));
  });
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
    m.bindPopup(`<b>${fmtPrice(it)}</b><br>${pTypeLabel(it.propertyType)}<br>${locLabel(it)}`);
    markers.push(m);
  });
}
function countActiveFilters(){
  let n=0;
  if($("fType").value)n++;if(state.districts.size)n++;
  if($("priceMin").value||$("priceMax").value)n++;
  if($("fRooms").value)n++;if(state.rentCat)n++;if(state.tenure)n++;
  if($("fAvail").value)n++;if($("fLiving").value)n++;if($("furnQ").value)n++;if($("fAmen").value)n++;
  if($("landMin").value||$("landMax").value||$("areaMin").value||$("areaMax").value)n++;
  if($("fFloors").value||$("fYear").value||$("fPark").value)n++;
  if(state.query)n++;
  return n;
}
function openSheet(){$("filtersBar").classList.add("open");$("sheetBg").classList.remove("hidden");}
function closeSheet(){$("filtersBar").classList.remove("open");$("sheetBg").classList.add("hidden");}
function updateMarkersSafe(){if(map)updateMarkers();}

function moneyIDR(v){return state.currency==="USD"?"$ "+Math.round(v/RATE).toLocaleString("en-US"):Math.round(v).toLocaleString("ru-RU")+" IDR";}
function openDetail(id){
  const it=LISTINGS.find(x=>x.id==id);if(!it)return;
  detailId=it.id;detailIdx=0;
  const term=it.dealType==="sale"?(state.lang==="ru"?"Продажа":"Sale"):(it.category==="yearly"?(state.lang==="ru"?"На год":"Yearly"):(state.lang==="ru"?"Долгосрочно":"Long-term"));
  const dep=it.dealType==="rent"?(it.category==="yearly"?Math.round(it.price/12):it.price):0;
  const rows=[
    [state.lang==="ru"?"Тип":"Type",pTypeLabel(it.propertyType)],
    [state.lang==="ru"?"Спальни":"Bedrooms",it.bedrooms||"—"],
    [state.lang==="ru"?"Площадь":"Area",it.area>0?it.area+" м²":"—"],
    [state.lang==="ru"?"Участок":"Land",it.landArea>0?it.landArea+" м²":"—"],
    [state.lang==="ru"?"Этажей":"Floors",it.floors||"—"],
    [state.lang==="ru"?"Год":"Year",it.yearBuilt||"—"],
    [state.lang==="ru"?"Мебель":"Furniture",it.furnished?(state.lang==="ru"?"Да":"Yes"):"—"],
    [state.lang==="ru"?"Залог":"Deposit",dep?moneyIDR(dep):"—"],
    [state.lang==="ru"?"Доступно":"Available",it.type==="request"?(it.moveIn||"—"):(it.available?fmtDate(it.available):(state.lang==="ru"?"Сейчас":"Now"))]];
  const agent=it.isAgent&&it.agentName?it.agentName:(state.lang==="ru"?"Собственник":"Owner");
  const d=0.02,box=`${(it.lng-d).toFixed(4)},${(it.lat-d*0.7).toFixed(4)},${(it.lng+d).toFixed(4)},${(it.lat+d*0.7).toFixed(4)}`;
  const fav=state.fav.has(it.id);
  const chips=[`<span class="param-chip">${pTypeLabel(it.propertyType)}</span>`];
  if(it.bedrooms>0)chips.push(`<span class="param-chip">${it.bedrooms} ${plural(it.bedrooms,["спальня","спальни","спален"])}</span>`);
  if(it.area>0)chips.push(`<span class="param-chip">${it.area} м²</span>`);
  chips.push(`<span class="param-chip">${term}</span>`);
  $("detailContent").innerHTML=`
  <div class="d-layout"><div class="d-left">
    <div class="main-photo"><img id="dMain" src="${it.images[0]}" onerror="this.onerror=null;this.src='${it.fb}'" alt="">
      ${it.images.length>1?`<button class="car-btn prev" data-dnav="prev" style="display:block">‹</button><button class="car-btn next" data-dnav="next" style="display:block">›</button>`:""}
      <span class="photo-counter" id="dCount">1/${it.images.length}</span></div>
    <div class="d-price-row"><div class="price">${fmtPrice(it)}</div>
      <div class="d-icons"><button id="dShare" title="Поделиться"><svg class="ic-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15V4M7 8l5-5 5 5"/><path d="M4 15v4a1 1 0 001 1h14a1 1 0 001-1v-4"/></svg></button>
      <button id="dFav" class="${fav?"on":""}" title="В избранное">${fav?"♥":"♡"}</button></div></div>
    <div class="params">${chips.join("")}</div>
    <div class="d-locrow"><span class="d-loc">${SVG_PIN} ${locLabel(it)}, Бали</span>
      <span class="d-meta">${SVG_EYE} ${it.views} <span class="time-pill">${timeAgo(it.createdAt)}</span></span></div>
    <div class="d-actions">${it.type==="request"
      ?`<button class="btn-call" data-offer="${it.id}">✉ ${t("offer_btn")}</button>`
      :`<a class="btn-call" href="tel:+6281234567890">Позвонить</a><a class="btn-tg" href="https://t.me/renthomebali" target="_blank" rel="noopener">Написать в Telegram</a>`}</div>
    ${it.legal?`<div class="legal">◈ ${t("legal_txt")} · ${agent}</div>`:""}
  </div><div class="d-right">
    <div class="card d-card"><h3>${state.lang==="ru"?"Характеристики":"Features"}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">${rows.map(r=>`<div class="flex items-baseline justify-between py-1.5 border-b border-slate-100 hover:bg-slate-50 rounded px-2 -mx-2 transition-colors"><span class="text-[13px] text-slate-500">${r[0]}</span><span class="text-[13px] font-semibold text-slate-800 text-right">${r[1]}</span></div>`).join("")}</div></div>
    <div class="card d-card"><h3>${state.lang==="ru"?"Удобства":"Amenities"}</h3>
      <div class="flex flex-wrap gap-2">${(it.amenities||[]).map(a=>`<span class="rounded-full bg-brand-soft text-brand-dark text-[13px] font-semibold px-3.5 py-1">${a}</span>`).join("")}</div></div>
    <div class="card d-card"><h3>${state.lang==="ru"?"На карте":"On map"}</h3>
      <iframe title="map" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${it.lat},${it.lng}"></iframe>
      <div class="map-row"><span class="muted">${locLabel(it)}, Бали, Индонезия</span><a class="btn-ghost" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}">${state.lang==="ru"?"Построить маршрут":"Directions"} →</a></div></div>
  </div></div>`;
  switchView("detail");window.scrollTo({top:0});
  try{location.hash="listing-"+it.id;}catch(e){}
  $("dShare").onclick=()=>{try{navigator.clipboard.writeText(location.href);}catch(e){}alert(state.lang==="ru"?"Ссылка скопирована!":"Link copied!");};
  $("dFav").onclick=()=>{const on=!state.fav.has(it.id);on?state.fav.add(it.id):state.fav.delete(it.id);localStorage.setItem("rh_fav",JSON.stringify([...state.fav]));const b=$("dFav");b.textContent=on?"♥":"♡";b.classList.toggle("on",on);render();};
}
function closeDetail(){try{history.replaceState(null,"",location.pathname+location.search);}catch(e){}switchView("list");syncDealTabs();}
function refreshDetail(){
  const it=LISTINGS.find(x=>x.id===detailId);if(!it||state.view!=="detail")return;
  const m=$("dMain");if(m){m.src=it.images[detailIdx%it.images.length];}
  const c=$("dCount");if(c)c.textContent=`${(detailIdx%it.images.length)+1}/${it.images.length}`;
}

document.addEventListener("click",e=>{
  const f=e.target.closest("[data-fav]");
  if(f){e.stopPropagation();const id=+f.dataset.fav;state.fav.has(id)?state.fav.delete(id):state.fav.add(id);localStorage.setItem("rh_fav",JSON.stringify([...state.fav]));render();return;}
  const c=e.target.closest("[data-car]");
  if(c){e.stopPropagation();const id=+c.dataset.id;const it=LISTINGS.find(x=>x.id===id);let i=state.carIdx[id]||0;i=(i+(c.dataset.car==="next"?1:-1)+it.images.length)%it.images.length;state.carIdx[id]=i;render();return;}
  const o=e.target.closest("[data-offer]");
  if(o){e.stopPropagation();alert(state.lang==="ru"?"Заявка отправлена владельцу запроса!":"Proposal sent!");return;}
  const ct=e.target.closest("[data-contact]");
  if(ct){e.stopPropagation();const it=LISTINGS.find(x=>x.id===+ct.dataset.contact);const nm=it&&it.isAgent&&it.agentName?it.agentName:(state.lang==="ru"?"Собственник":"Owner");alert(state.lang==="ru"?"Свяжемся с "+nm+" в течение часа!":"We will contact "+nm);return;}
  const p=e.target.closest("[data-page]");
  if(p){state.page=+p.dataset.page;render();window.scrollTo({top:0,behavior:"smooth"});return;}
  const cr=e.target.closest("[data-crumb]");
  if(cr){const k=cr.dataset.crumb;if(k==="home")resetFilters();if(k==="deal"){$("fType").value="";state.districts.clear();}if(k==="role"){}state.page=1;render();return;}
  const q=e.target.closest("[data-q]");
  if(q){applyQuick(q.dataset.q);return;}
  const th=e.target.closest("[data-thumb]");
  if(th){detailIdx=+th.dataset.thumb;refreshDetail();return;}
  const dn=e.target.closest("[data-dnav]");
  if(dn){const it=LISTINGS.find(x=>x.id===detailId);if(it){detailIdx=(detailIdx+(dn.dataset.dnav==="next"?1:-1)+it.images.length)%it.images.length;refreshDetail();}return;}
  const chip=e.target.closest("[data-chip]");
  if(chip){e.stopPropagation();if(chip.dataset.chip==="type")$("fType").value=chip.dataset.v;if(chip.dataset.chip==="bed")$("fRooms").value=chip.dataset.v;state.page=1;render();window.scrollTo({top:0,behavior:"smooth"});return;}
  const card=e.target.closest("[data-card]");
  if(card&&!e.target.closest("button")){openDetail(card.dataset.card);return;}
  const bn=e.target.closest(".bn-item");
  if(bn){switchView(bn.dataset.view);syncDealTabs();return;}
});

function resetFilters(){
  ["priceMin","priceMax","landMin","landMax","areaMin","areaMax","fYear","fAvail","fLiving"].forEach(id=>{if($(id))$(id).value="";});
  ["fType","fRooms","fFloors","furnQ","fPark","fAmen"].forEach(id=>{if($(id))$(id).value="";});
  state.districts.clear();state.tenure="";state.query="";if($("mquery"))$("mquery").value="";if($("dquery"))$("dquery").value="";
  state.page=1;activeQuick="";highlightQuick();
}
let activeQuick="";
function applyQuick(key){
  if(key==="sim_credit"){openCredit();return;}
  resetFilters();
  activeQuick=key;
  if(key==="buy_house"){state.deal="sale";state.role="offer";$("fType").value="";syncRoleTabs();}
  if(key==="buy_land"){state.deal="sale";state.role="offer";$("fType").value="land";syncRoleTabs();}
  if(key==="rent_house"){state.deal="rent";state.role="offer";$("fType").value="";state.rentCat="";syncRoleTabs();}
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

$("applyBtn").onclick=()=>{state.page=1;render();if(state.view!=="list")switchView("list");syncDealTabs();updateMarkersSafe();closeSheet();};
$("resetBtn").onclick=()=>{resetFilters();state.rentCat="";closeSheet();render();};
$("advBtn").onclick=()=>$("advPanel").classList.toggle("hidden");
$("sortSelect").onchange=e=>{state.sort=e.target.value;state.page=1;render();};
document.querySelectorAll("[data-deal]").forEach(b=>b.onclick=()=>setDeal(b.dataset.deal));
$("tabOffer").onclick=()=>{state.role="offer";state.page=1;$("tabOffer").classList.add("active");$("tabRequest").classList.remove("active");render();updateMarkersSafe();};
$("tabRequest").onclick=()=>{state.role="request";state.page=1;$("tabRequest").classList.add("active");$("tabOffer").classList.remove("active");render();updateMarkersSafe();};
document.querySelectorAll(".seg-btn").forEach(b=>b.onclick=()=>{if(b.dataset.cat){state.rentCat=state.rentCat===b.dataset.cat?"":b.dataset.cat;}if(b.dataset.tenure){state.tenure=state.tenure===b.dataset.tenure?"":b.dataset.tenure;}state.page=1;render();});
$("favHeaderBtn").onclick=()=>{switchView("fav");syncDealTabs();};
$("profileBtn").onclick=()=>{switchView("profile");syncDealTabs();};
$("logoBtn").onclick=e=>{e.preventDefault();closeDetail();window.scrollTo({top:0,behavior:"smooth"});};
["fType","fRooms","fLiving","furnQ","fFloors","fPark","fAmen","sortSelect","currencySelect"].forEach(id=>{const el=$(id);if(el)enhanceSelect(el);});
if($("fAvail"))enhanceMonth($("fAvail"));
document.addEventListener("click",e=>{if(!e.target.closest(".dd"))closeAllDD();});
let qTimer=null;
document.querySelectorAll("[data-mdeal]").forEach(b=>b.onclick=()=>{state.deal=b.dataset.mdeal;state.role="offer";state.page=1;syncRoleTabs();switchView("list");syncDealTabs();render();updateMarkersSafe();});
document.querySelectorAll("[data-mtype]").forEach(b=>b.onclick=()=>{const cur=$("fType").value===b.dataset.mtype;$("fType").value=cur?"":b.dataset.mtype;state.page=1;render();});
if($("mquery"))$("mquery").addEventListener("input",e=>{clearTimeout(qTimer);qTimer=setTimeout(()=>{state.query=e.target.value;state.page=1;render();},250);});
if($("dquery"))$("dquery").addEventListener("input",e=>{clearTimeout(qTimer);qTimer=setTimeout(()=>{state.query=e.target.value;state.page=1;render();},250);});
if($("mshow"))$("mshow").onclick=()=>{state.page=1;render();document.getElementById("cardsGrid").scrollIntoView({behavior:"smooth"});};
if($("mfilterBtn"))$("mfilterBtn").onclick=()=>openSheet();
if($("mreset"))$("mreset").onclick=()=>{resetFilters();state.rentCat="";render();};
if($("seeAll"))$("seeAll").onclick=()=>{resetFilters();state.rentCat="";render();window.scrollTo({top:0,behavior:"smooth"});};
if($("sheetBg"))$("sheetBg").onclick=()=>closeSheet();
if($("sheetApply"))$("sheetApply").onclick=()=>$("applyBtn").click();
if($("sheetReset"))$("sheetReset").onclick=()=>$("resetBtn").click();
if($("sheetAdv"))$("sheetAdv").onclick=()=>$("advBtn").click();
$("locHeader").onclick=e=>{e.stopPropagation();toggleLoc();};
document.addEventListener("click",e=>{if(!e.target.closest("#locFilter"))toggleLoc(false);});
$("detailClose").onclick=()=>closeDetail();
$("detailModal").addEventListener("click",e=>{if(e.target.id==="detailModal")closeDetail();});
if($("advIconBtn"))$("advIconBtn").onclick=()=>$("advBtn").click();
$("filtersClose").onclick=()=>$("filtersModal").classList.add("hidden");
$("filtersModalApply").onclick=()=>{$("filtersModal").classList.add("hidden");$("applyBtn").click();};
$("currencySelect").onchange=e=>{state.currency=e.target.value;render();};
$("themeBtn").onclick=()=>{const r=document.documentElement;const dark=r.dataset.theme==="dark";r.dataset.theme=dark?"":"dark";$("themeBtn").textContent=dark?"○":"●";};
$("creditClose").onclick=()=>$("creditModal").classList.add("hidden");
$("creditModal").addEventListener("click",e=>{if(e.target.id==="creditModal")$("creditModal").classList.add("hidden");});
$("simCalc").onclick=calcCredit;
["simPrice","simDP","simRate","simYears"].forEach(id=>$(id).addEventListener("input",calcCredit));
render();syncDealTabs();highlightQuick();document.body.dataset.settled="1";
try{const m=location.hash.match(/#listing-(\d+)/);if(m)openDetail(+m[1]);}catch(e){}
