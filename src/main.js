import Globe from 'globe.gl';

// ================= UI =================

// 信息卡片
const infoBox = document.createElement('div');
Object.assign(infoBox.style, {
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '360px',
  maxHeight: '80vh',
  overflowY: 'auto',
  padding: '20px',
  background: 'linear-gradient(180deg,#0a0f1c,#101a2e)',
  color: '#e6f1ff',
  borderRadius: '14px',
  border: '1px solid rgba(0,255,255,0.2)',
  display: 'none',
  zIndex: '999'
});
document.body.appendChild(infoBox);

// 搜索框
const searchBox = document.createElement('input');
searchBox.placeholder = "🔍 搜索国家...";
Object.assign(searchBox.style, {
  position: 'absolute',
  top: '20px',
  left: '20px',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid rgba(0,255,255,0.3)',
  background: '#0a0f1c',
  color: '#0ff',
  zIndex: '999'
});
document.body.appendChild(searchBox);

// 左侧列表
const listBox = document.createElement('div');
Object.assign(listBox.style, {
  position: 'absolute',
  top: '70px',
  left: '20px',
  width: '220px',
  maxHeight: '80vh',
  overflowY: 'auto',
  padding: '10px',
  background: '#0a0f1c',
  border: '1px solid rgba(0,255,255,0.2)',
  borderRadius: '10px',
  color: '#0ff',
  zIndex: '999'
});
document.body.appendChild(listBox);

// ================= 🌍 地球 =================

const globe = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');

let hoverD = null;
let selectedD = null;
let allCountries = [];
let nameMap = {};
let countryMeta = {};
let rates = {};
let usdToCny = 0;
let rotateTimer = null;

// ================= 数据 =================

Promise.all([
  fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(r => r.json()),
  fetch('https://unpkg.com/world-countries/dist/countries.json').then(r => r.json()),
  fetch('https://open.er-api.com/v6/latest/USD').then(r => r.json())
])
.then(([geoData, countryList, rateData]) => {

  rates = rateData.rates;
  usdToCny = rates['CNY'];

  countryList.forEach(c => {
    const en = c.name.common;
    const zh = c.translations?.zho?.common;

    if (en && zh) {
      nameMap[en] = zh;

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
    }
  });

  allCountries = geoData.features;

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
      document.body.style.cursor = d ? 'pointer' : 'default';
      refresh();
    })

    .onPolygonClick(d => selectCountry(d));

  globe.controls().autoRotate = true;
  globe.controls().autoRotateSpeed = 0.35;
});

// ================= 功能 =================

// 左侧列表
function renderList() {
  listBox.innerHTML = allCountries.map(d => {
    const zh = nameMap[d.properties.name] || d.properties.name;
    const active = d === selectedD ? 'color:#fff;font-weight:bold' : '';
    return `<div style="cursor:pointer;padding:4px;${active}">${zh}</div>`;
  }).join('');

  listBox.querySelectorAll('div').forEach((el, i) => {
    el.onclick = () => selectCountry(allCountries[i]);
  });
}

// 选中
function selectCountry(d) {
  selectedD = d;
  focusCountry(d);
  showInfo(d);
  renderList();
  refresh();

  globe.controls().autoRotate = false;

  if (rotateTimer) clearTimeout(rotateTimer);
  rotateTimer = setTimeout(() => {
    globe.controls().autoRotate = true;
  }, 60000);
}

// 刷新颜色
function refresh() {
  globe.polygonCapColor(globe.polygonCapColor());
}

// 飞行
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

// ================= 右侧信息 =================

async function showInfo(d) {
  const en = d.properties.name;
  const zh = nameMap[en] || en;
  const meta = countryMeta[en] || {};

  infoBox.style.display = "block";
  infoBox.innerHTML = `<h2>${zh}</h2><p>加载中...</p>`;

  try {
    const res = await fetch(
      `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(zh)}`
    );
    const data = await res.json();

    const text = data.extract || "";
    const wikiLink = `https://zh.wikipedia.org/wiki/${encodeURIComponent(zh)}`;

    const museumCount = (text.match(/博物馆/g) || []).length;

    let rateText = "暂无";
    if (meta.currencyCode && rates[meta.currencyCode]) {
      const usdToLocal = rates[meta.currencyCode];
      const localToCny = usdToCny / usdToLocal;
      rateText = `1 ${meta.currencyCode} ≈ ${localToCny.toFixed(2)} 人民币`;
    }

    infoBox.innerHTML = `
      <h2>${zh}</h2>

      ${meta.flag ? `<img src="${meta.flag}" style="width:60px">` : ""}

      <h3>📖 国家简介</h3>
      <p>${text}</p>

      <h3>🏛 博物馆</h3>
      <p>提及约：${museumCount} 次</p>

      <h3>💰 货币</h3>
      <p>${meta.currencyName}（${meta.currencyCode || ""}）</p>
      <p>${rateText}</p>

      <p>
        🔗 <a href="${wikiLink}" target="_blank" style="color:#0ff">
        查看维基百科
        </a>
      </p>
    `;
  } catch {
    infoBox.innerHTML = `<h2>${zh}</h2><p>加载失败</p>`;
  }
}

// ================= 搜索 =================

searchBox.addEventListener('keydown', e=>{
  if(e.key==='Enter'){
    const k = searchBox.value.trim();
    const f = allCountries.find(d =>
      (nameMap[d.properties.name] || "").includes(k)
    );
    if (f) selectCountry(f);
    else alert("未找到国家");
  }
});