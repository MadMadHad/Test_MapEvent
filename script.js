// map init
const map = L.map('map', {
  center: [25, 120],
  zoom: 2,
});

// base map
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// search bar
L.Control.geocoder({ position: 'topright' }).addTo(map);

// scale bar
L.control.scale().addTo(map);

// category styles
const categoryStyles = {
  RNS:    { color: '#cc0000', fillColor: '#ff9999' },
  GNS:    { color: '#4caf04', fillColor: '#b6f270' },
  SNF:    { color: '#ccaa00', fillColor: '#fff176' },
  OIL:    { color: '#111111', fillColor: '#888888' },
  UP:     { color: '#1b5e20', fillColor: '#a5d6a7' },
  TRICHO: { color: '#6a1b9a', fillColor: '#ce93d8' },
  default:{ color: '#333333', fillColor: '#cccccc' }
};

// active categories (all on by default)
const activeCategories = new Set(Object.keys(categoryStyles).filter(k => k !== 'default'));

function getStyle(feature, hover = false) {
  const s = categoryStyles[feature.properties.category] || categoryStyles.default;
  return {
    color: s.color,
    weight: hover ? 3 : 2,
    fillColor: s.fillColor,
    fillOpacity: hover ? 0.6 : 0.4
  };
}

// coordinate display
const coordDisplay = L.control({ position: 'bottomright' });
coordDisplay.onAdd = function() {
  this._div = L.DomUtil.create('div', 'coord-display');
  this._div.innerHTML = 'Hover map';
  return this._div;
};
coordDisplay.addTo(map);
map.on('mousemove', function(e) {
  coordDisplay._div.innerHTML =
    `${e.latlng.lat.toFixed(3)}°, ${e.latlng.lng.toFixed(3)}°`;
});
map.on('mouseout', function() {
  coordDisplay._div.innerHTML = 'Hover map';
});

// monthly cache
let cachedMonth = null;
let cachedData = null;
let currentLayer = null;

function renderDay(data, dateStr) {
  if (!data) return;
  if (currentLayer) map.removeLayer(currentLayer);
  const dayFeatures = {
    ...data,
    features: data.features.filter(f =>
      f.properties.date === dateStr &&
      activeCategories.has(f.properties.category)
    )
  };
  currentLayer = L.geoJSON(dayFeatures, {
    style: feature => getStyle(feature),
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.title, { sticky: true });
      layer.on({
        mouseover: e => e.target.setStyle(getStyle(feature, true)),
        mouseout: e => currentLayer.resetStyle(e.target),
        click: e => {
          L.popup()
            .setLatLng(e.latlng)
            .setContent(`
              <b>${feature.properties.title}</b><br/>
              ${feature.properties.description}
            `)
            .openOn(map);
        }
      });
    }
  }).addTo(map);
}

function loadEvents(dateStr) {
  const monthStr = dateStr.slice(0, 7);
  if (cachedMonth === monthStr) {
    renderDay(cachedData, dateStr);
  } else {
    fetch(`data/${monthStr}.json`)
      .then(r => r.json())
      .then(data => {
        cachedMonth = monthStr;
        cachedData = data;
        renderDay(data, dateStr);
      })
      .catch(() => {
        if (currentLayer) map.removeLayer(currentLayer);
        currentLayer = null;
        cachedData = null;
      });
  }
}

// today as max date
const today = new Date();
today.setHours(0, 0, 0, 0);

function clampToToday(d) {
  if (d > today) {
    return new Date(today);
  }
  return d;
}

// date state
let date = new Date("2026-04-20");

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function refresh() {
  date = clampToToday(date);
  document.getElementById("year").innerText = date.getFullYear();
  document.getElementById("month").innerText = String(date.getMonth() + 1).padStart(2,'0');
  document.getElementById("day").innerText = String(date.getDate()).padStart(2,'0');
  loadEvents(formatDate(date));
}

// prevent map interactions (click, dblclick, scroll) bleeding through the time panel
///const timePanel = document.getElementById('timePanel');
//L.DomEvent.disableClickPropagation(timePanel);
//L.DomEvent.disableScrollPropagation(timePanel);
//timePanel.addEventListener('dblclick', e => e.stopPropagation());

document.getElementById("yearUp").onclick    = () => { date.setFullYear(date.getFullYear() + 1); refresh(); };
document.getElementById("yearDown").onclick  = () => { date.setFullYear(date.getFullYear() - 1); refresh(); };
document.getElementById("monthUp").onclick   = () => { date.setMonth(date.getMonth() + 1); refresh(); };
document.getElementById("monthDown").onclick = () => { date.setMonth(date.getMonth() - 1); refresh(); };
document.getElementById("dayUp").onclick     = () => { date.setDate(date.getDate() + 1); refresh(); };
document.getElementById("dayDown").onclick   = () => { date.setDate(date.getDate() - 1); refresh(); };
document.getElementById("leftDay").onclick   = () => { date.setDate(date.getDate() - 1); refresh(); };
document.getElementById("rightDay").onclick  = () => { date.setDate(date.getDate() + 1); refresh(); };

refresh();
