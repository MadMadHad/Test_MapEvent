// map init
const map = L.map('map', {
  center: [25, 0],
  zoom: 2
});
// base map
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);
// search bar
L.Control.geocoder({
  position: 'topright'
}).addTo(map);

// category colors
const categoryStyles = {
  oil_spill: {
    color: '#7a0000',
    fillColor: '#cc0000'
  },
  algae_bloom: {
    color: '#1a5c1a',
    fillColor: '#33cc33'
  },
  pollution: {
    color: '#7a5c00',
    fillColor: '#ccaa00'
  },
  default: {
    color: '#333333',
    fillColor: '#000000'
  }
};

// lat/lon display
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

function getStyle(feature, hover = false) {
  const s = categoryStyles[feature.properties.category] || categoryStyles.default;
  return {
    color: s.color,
    weight: hover ? 3 : 2,
    fillColor: s.fillColor,
    fillOpacity: hover ? 0.6 : 0.4
  };
}

// monthly cache
let cachedMonth = null;
let cachedData = null;
let currentLayer = null;

function renderDay(data, dateStr) {
  if (currentLayer) map.removeLayer(currentLayer);
  const dayFeatures = {
    ...data,
    features: data.features.filter(f => f.properties.date === dateStr)
  };
  currentLayer = L.geoJSON(dayFeatures, {
    style: feature => getStyle(feature),
    onEachFeature: (feature, layer) => {
      layer.on({
        mouseover: e => e.target.setStyle(getStyle(feature, true)),
        mouseout: e => currentLayer.resetStyle(e.target),
        click: e => {
          const wiki = "https://en.wikipedia.org/wiki/Special:Random";
          L.popup()
            .setLatLng(e.latlng)
            .setContent(`
              <b>${feature.properties.title}</b><br/>
              ${feature.properties.description}<br/><br/>
              <a href="${wiki}" target="_blank">Random Wikipedia page</a>
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
      });
  }
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
  document.getElementById("year").innerText = date.getFullYear();
  document.getElementById("month").innerText = String(date.getMonth() + 1).padStart(2,'0');
  document.getElementById("day").innerText = String(date.getDate()).padStart(2,'0');
  loadEvents(formatDate(date));
}

document.getElementById("yearUp").onclick   = () => { date.setFullYear(date.getFullYear() + 1); refresh(); };
document.getElementById("yearDown").onclick = () => { date.setFullYear(date.getFullYear() - 1); refresh(); };
document.getElementById("monthUp").onclick  = () => { date.setMonth(date.getMonth() + 1); refresh(); };
document.getElementById("monthDown").onclick= () => { date.setMonth(date.getMonth() - 1); refresh(); };
document.getElementById("dayUp").onclick    = () => { date.setDate(date.getDate() + 1); refresh(); };
document.getElementById("dayDown").onclick  = () => { date.setDate(date.getDate() - 1); refresh(); };
document.getElementById("leftDay").onclick  = () => { date.setDate(date.getDate() - 1); refresh(); };
document.getElementById("rightDay").onclick = () => { date.setDate(date.getDate() + 1); refresh(); };

refresh();
