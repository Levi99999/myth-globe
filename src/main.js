import Globe from 'globe.gl';
import visaAutoData from './visa_auto.json';
import visaData from './visa.json'; // 你原来的



// ================= 🌍 全局数据 =================
let allCountries = [];
let countryList = [];
let cache = {};

let countryMeta = {};
let rates = {};
let usdToCny = 0;

// ================= 🌍 地球 =================
const globe = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg');

let selectedD = null;
let hoverD = null;

// ================= 🌍 UI =================
const listBox = document.createElement('div');
Object.assign(listBox.style, {
  position: 'absolute',
  top: '20px',
  left: '20px',
  width: '260px',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: '#0a0f1c',
  color: '#0ff',
  padding: '10px',
  zIndex: '999'
});
document.body.appendChild(listBox);

const infoBox = document.createElement('div');
Object.assign(infoBox.style, {
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '360px',
  maxHeight: '80vh',
  overflowY: 'auto',
  padding: '20px',
  background: '#0a0f1c',
  color: '#fff',
  display: 'none',
  zIndex: '999'
});
document.body.appendChild(infoBox);

const searchBox = document.createElement('input');
searchBox.placeholder = "🔍 搜索国家（中 / 英）";
Object.assign(searchBox.style, {
  position: 'absolute',
  top: '20px',
  left: '300px',
  padding: '10px',
  borderRadius: '8px',
  zIndex: '999'
});
document.body.appendChild(searchBox);

const tooltip = document.createElement('div');
Object.assign(tooltip.style, {
  position: 'absolute',
  pointerEvents: 'none',
  background: '#000',
  color: '#fff',
  padding: '5px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  display: 'none',
  zIndex: 9999
});
document.body.appendChild(tooltip);

// ================= 🌍 数据加载 =================
Promise.all([
  fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(r => r.json()),
  fetch('https://unpkg.com/world-countries/dist/countries.json').then(r => r.json()),
  fetch('https://open.er-api.com/v6/latest/USD').then(r => r.json())
]).then(([geoData, countries, rateData]) => {

  allCountries = geoData.features;
  countryList = countries;

  rates = rateData.rates;
  usdToCny = rates['CNY'];

  // 构建货币信息
  countries.forEach(c => {
    const en = c.name.common;
    const currencyCode = c.currencies
      ? Object.keys(c.currencies)[0]
      : null;

    countryMeta[en] = {
      flag: c.flags?.png,
      currencyName: currencyCode
        ? c.currencies[currencyCode].name
        : "未知",
      currencyCode
    };
  });

  renderList();

  globe
    .polygonsData(allCountries)
    .polygonAltitude(d => d === selectedD ? 0.03 : 0.01)
    .polygonCapColor(d => {
      if (d === selectedD) return 'rgba(0,255,255,0.8)';
      if (d === hoverD) return 'orange';
      return 'rgba(0,150,255,0.3)';
    })
    .onPolygonHover(d => {
      hoverD = d;

      if (d) {
        tooltip.innerText = getCountryInfo(d.properties.name).zh;
        tooltip.style.display = 'block';
      } else {
        tooltip.style.display = 'none';
      }

      refresh();
    })
    .onPolygonClick(d => selectCountry(d));

  window.addEventListener('mousemove', e => {
    tooltip.style.left = e.clientX + 10 + 'px';
    tooltip.style.top = e.clientY + 10 + 'px';
  });
});

// ================= 🌍 国家信息匹配 =================
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD") // 去重音
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim();
}

function getCountryInfo(en) {
  if (!en) return { zh: en, region: "Other" };

  if (cache[en]) return cache[en];

  // ================= 🌍 强力标准化映射 =================
  const aliasMap = {
  // ===== 美国 =====
  "usa": "united states",
  "united states of america": "united states",

  // ===== 欧洲 =====
  "czech republic": "czechia",

  // ===== 非洲 =====
  "Ivory Coast": "cote d'ivoire",
  "swaziland": "eswatini",

  // ===== 亚洲 =====
  "South Korea": "korea, republic of",
  "North Korea": "korea, democratic people's republic of",

  "Laos": "lao people's democratic republic",
  "Vietnam": "viet nam",

  "east timor": "timor-leste",

  // ===== 中东 =====
  "iran": "iran (islamic republic of)",
  "syria": "syrian arab republic",

  // ===== 欧洲/亚洲 =====
  "russia": "russian federation",
  "turkey": "turkiye", // 保留（防止异常）

  // ===== 南美 =====
  "venezuela": "venezuela (bolivarian republic of)",
  "bolivia": "bolivia (plurinational state of)",

  // ===== 非洲 =====
  "tanzania": "tanzania, united republic of",

  // ===== 欧洲 =====
  "moldova": "moldova, republic of",

  // ===== 其他 =====
  "cape verde": "cabo verde",
  "brunei": "brunei darussalam",

  // ===== 英国拆分 =====
  "england": "united kingdom",
  "scotland": "united kingdom",
  "wales": "united kingdom",

  // ===== 特殊地区 =====
  "west bank": "palestine"
};

  // 👉 统一 key
  let key = normalize(en);

  // 👉 映射标准名
  if (aliasMap[key]) {
    key = normalize(aliasMap[key]);
  }

  // ================= 🌍 精确匹配（完全标准化后） =================
  let match = countryList.find(c => {
    const enName = normalize(c.name.common);
    return enName === key;
  });

  // ================= 🌍 最终兜底 =================
  if (!match) {
    match = countryList.find(c => {
      const enName = normalize(c.name.common);
      return enName.includes(key) || key.includes(enName);
    });
  }

  const result = {
    zh: match?.translations?.zho?.common || en,
    region: match?.region || "Other",
    enMatched: match?.name.common
  };

  cache[en] = result;
  return result;
}

// ================= 🌍 分组 =================
function groupByRegion() {
  const groups = {};

  allCountries.forEach(d => {
    const { region } = getCountryInfo(d.properties.name);

    if (!groups[region]) groups[region] = [];
    groups[region].push(d);
  });

  return groups;
}

// ================= 🌍 左侧列表 =================
function renderList() {
  const groups = groupByRegion();

  const regionMap = {
    Asia: "亚洲",
    Europe: "欧洲",
    Africa: "非洲",
    Americas: "美洲",
    Oceania: "大洋洲",
    Other: "其他"
  };

  listBox.innerHTML = "";

  Object.entries(groups).forEach(([region, arr]) => {

    const title = document.createElement("div");
    title.innerText = regionMap[region];
    title.style.fontWeight = "bold";
    title.style.color = "#fff";
    title.style.marginTop = "8px";
    listBox.appendChild(title);

    arr.forEach(d => {
      const item = document.createElement("div");
      item.innerText = getCountryInfo(d.properties.name).zh;
      item.style.cursor = "pointer";
      item.style.paddingLeft = "10px";

      // ✅ 关键：绑定真实对象
      item.onclick = () => selectCountry(d);

      listBox.appendChild(item);
    });
  });
}

// ================= 🌍 交互 =================
function selectCountry(d) {
  selectedD = d;
  focusCountry(d);
  showInfo(d);
  refresh();
}

function refresh() {
  globe.polygonCapColor(globe.polygonCapColor());
}

// 飞行定位
function focusCountry(d) {
  const coords = d.geometry.coordinates;
  let lat = 0, lng = 0, count = 0;

  const process = arr => arr.forEach(([x,y])=>{
    lat+=y; lng+=x; count++;
  });

  if(d.geometry.type==="Polygon"){
    coords.forEach(process);
  }else{
    coords.forEach(p=>p.forEach(process));
  }

  globe.pointOfView({
    lat: lat/count,
    lng: lng/count,
    altitude: 1.6
  },1000);
}

// ================= 🌍 右侧卡片 =================
async function showInfo(d) {
  const rawName = d.properties.name;
  const info = getCountryInfo(rawName);
  const zh = info.zh;
  const meta = countryMeta[info.enMatched] || {};

  infoBox.style.display = "block";
  infoBox.innerHTML = `<h2>${zh}</h2><p>加载中...</p>`;

  try {
    

    // ===== 📖 维基 =====
    const res = await fetch(
      `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(zh)}`
    );
    const data = await res.json();

    const text = data.extract || "";
    const wikiLink = `https://zh.wikipedia.org/wiki/${encodeURIComponent(zh)}`;
    const museumCount = (text.match(/博物馆/g) || []).length;

    // ===== 💰 汇率 =====
    let rateText = "暂无";
    if (meta.currencyCode && rates[meta.currencyCode]) {
      const usdToLocal = rates[meta.currencyCode];
      const localToCny = usdToCny / usdToLocal;
      rateText = `1 ${meta.currencyCode} ≈ ${localToCny.toFixed(2)} 人民币`;
    }

    // ===== 🛂 签证 =====
    const visa = visaData[zh] || visaAutoData[zh];
    let visaHTML = "<p>暂无信息</p>";

    if (visa) {
      visaHTML = `
        <p>类型：${visa.type}</p>
        <p>停留：${visa.stay}</p>
        <p>说明：${visa.note}</p>
        <p>
          🔗 <a href="${visa.link}" target="_blank" style="color:#0ff">
          官方信息（外交部）
          </a>
        </p>
      `;
    }

    // ===== UI 渲染 =====
    infoBox.innerHTML = `
      <div style="position:relative">

        <div id="closeBtn"
          style="position:absolute;top:0;right:0;cursor:pointer;font-size:18px;">
          ✖
        </div>

        <h2>${zh}</h2>

        ${meta.flag ? `<img src="${meta.flag}" style="width:60px">` : ""}

        <h3>📖 国家简介</h3>
        <p>${text}</p>







        <h3>🛂 签证信息</h3>
        ${visaHTML}

        <h3>🏛 博物馆</h3>
        <p>提及约：${museumCount} 次</p>

        <h3>💰 货币</h3>
        <p>${meta.currencyName || "未知"}（${meta.currencyCode || ""}）</p>
        <p>${rateText}</p>

        <p>
          🔗 <a href="${wikiLink}" target="_blank" style="color:#0ff">
          查看维基百科
          </a>
        </p>

      </div>
    `;

    document.getElementById('closeBtn').onclick = () => {
      infoBox.style.display = "none";
    };

  } catch (err) {
    console.error(err);
    infoBox.innerHTML = `<h2>${zh}</h2><p>加载失败</p>`;
  }
}

function closeInfo() {
  infoBox.style.display = "none";
}


// ================= 🌍 搜索 =================
searchBox.addEventListener('keydown', e=>{
  if(e.key==='Enter'){
    const k = searchBox.value.trim().toLowerCase();

    const f = allCountries.find(d => {
      const en = d.properties.name.toLowerCase();
      const zh = getCountryInfo(d.properties.name).zh;

      return zh.includes(k) || en.includes(k);
    });

    if (f) selectCountry(f);
    else alert("未找到国家");
  }
});