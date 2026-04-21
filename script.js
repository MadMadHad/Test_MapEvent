// map init
const map = L.map('map', {
  center: [25, -90],
  zoom: 4
});

// base map
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// search bar
L.Control.geocoder().addTo(map);

// event layer
let currentLayer;

// style
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

// load events
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
                  <a href="${wiki}" target="_blank">Random Wikipedia page</a>
                `)
                .openOn(map);
            }
          });
        }
      }).addTo(map);
      // Zoom to event automatically?
      //map.fitBounds(currentLayer.getBounds());
    });
}

// date state
let date = new Date("2026-04-20");

// format helper
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// UI refresh
function refresh() {
  document.getElementById("year").innerText = date.getFullYear();
  document.getElementById("month").innerText = String(date.getMonth() + 1).padStart(2,'0');
  document.getElementById("day").innerText = String(date.getDate()).padStart(2,'0');

  loadEvents(formatDate(date));
}

// year
document.getElementById("yearUp").onclick = () => { date.setFullYear(date.getFullYear() + 1); refresh(); };
document.getElementById("yearDown").onclick = () => { date.setFullYear(date.getFullYear() - 1); refresh(); };

// month
document.getElementById("monthUp").onclick = () => { date.setMonth(date.getMonth() + 1); refresh(); };
document.getElementById("monthDown").onclick = () => { date.setMonth(date.getMonth() - 1); refresh(); };

// day
document.getElementById("dayUp").onclick = () => { date.setDate(date.getDate() + 1); refresh(); };
document.getElementById("dayDown").onclick = () => { date.setDate(date.getDate() - 1); refresh(); };

// left/right day nav
document.getElementById("leftDay").onclick = () => { date.setDate(date.getDate() - 1); refresh(); };
document.getElementById("rightDay").onclick = () => { date.setDate(date.getDate() + 1); refresh(); };

// init
refresh();
