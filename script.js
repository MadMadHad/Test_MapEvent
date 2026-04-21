// map init
const map = L.map('map', {
  center: [25, -90],
  zoom: 4
});

// basemap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// always visible search
const geocoder = L.Control.geocoder();
geocoder.addTo(map);

document.getElementById("search").appendChild(geocoder.getContainer());

// event layer
let currentLayer;

// styles
function defaultStyle() {
  return {
    color: '#cc0000',
    weight: 2,
    fillColor: '#ff6666',
    fillOpacity: 0.4
  };
}

function hoverStyle() {
  return {
    color: '#ff0000',
    weight: 3,
    fillColor: '#ff4d4d',
    fillOpacity: 0.6
  };
}

// load events (NO auto zoom)
function loadEvents(dateStr) {
  if (currentLayer) {
    map.removeLayer(currentLayer);
  }

  fetch(`data/${dateStr}.json`)
    .then(r => r.json())
    .then(data => {
      currentLayer = L.geoJSON(data, {
        style: defaultStyle,
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: e => e.target.setStyle(hoverStyle()),
            mouseout: e => currentLayer.resetStyle(e.target),
            click: e => {
              const wiki = "https://en.wikipedia.org/wiki/Special:Random";

              L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                  <b>${feature.properties.title}</b><br/>
                  ${feature.properties.description}<br/><br/>
                  <a href="${wiki}" target="_blank">Wikipedia</a>
                `)
                .openOn(map);
            }
          });
        }
      }).addTo(map);
    });
}

// date state
let currentDate = new Date("2026-04-20");

// format helper
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// sync UI + map
function sync() {
  document.getElementById("yearDisplay").innerText = currentDate.getFullYear();
  document.getElementById("monthDisplay").innerText = String(currentDate.getMonth() + 1).padStart(2,'0');
  document.getElementById("dayDisplay").innerText = String(currentDate.getDate()).padStart(2,'0');

  loadEvents(formatDate(currentDate));
}

// controls
document.getElementById("yearUp").onclick = () => { currentDate.setFullYear(currentDate.getFullYear() + 1); sync(); };
document.getElementById("yearDown").onclick = () => { currentDate.setFullYear(currentDate.getFullYear() - 1); sync(); };

document.getElementById("monthUp").onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); sync(); };
document.getElementById("monthDown").onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); sync(); };

document.getElementById("dayUp").onclick = () => { currentDate.setDate(currentDate.getDate() + 1); sync(); };
document.getElementById("dayDown").onclick = () => { currentDate.setDate(currentDate.getDate() - 1); sync(); };

document.getElementById("dayIncrement").onclick = () => { currentDate.setDate(currentDate.getDate() + 1); sync(); };
document.getElementById("dayDecrement").onclick = () => { currentDate.setDate(currentDate.getDate() - 1); sync(); };

// init
sync();
