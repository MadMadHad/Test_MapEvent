// map
const map = L.map('map', {
  center: [25, -90],
  zoom: 4
});

// base layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

let layer;

// style
function style() {
  return {
    color: '#cc0000',
    weight: 2,
    fillColor: '#ff6666',
    fillOpacity: 0.4
  };
}

// load events (NO auto zoom)
function load(dateStr) {
  if (layer) map.removeLayer(layer);

  fetch(`data/${dateStr}.json`)
    .then(r => r.json())
    .then(data => {
      layer = L.geoJSON(data, {
        style,
        onEachFeature: (f, l) => {
          l.on({
            mouseover: e => {
              e.target.setStyle({
                color: '#ff0000',
                fillOpacity: 0.6
              });
            },
            mouseout: e => layer.resetStyle(e.target),
            click: e => {
              L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                  <b>${f.properties.title}</b><br/>
                  ${f.properties.description}<br/><br/>
                  <a href="https://en.wikipedia.org/wiki/Special:Random" target="_blank">Wikipedia</a>
                `)
                .openOn(map);
            }
          });
        }
      }).addTo(map);
    });
}

// date state
let date = new Date("2026-04-20");

// format
function format(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// sync UI + map
function sync() {
  document.getElementById("yearDisplay").innerText = date.getFullYear();
  document.getElementById("monthDisplay").innerText = String(date.getMonth() + 1).padStart(2,'0');
  document.getElementById("dayDisplay").innerText = String(date.getDate()).padStart(2,'0');

  load(format(date));
}

// controls
document.getElementById("yearUp").onclick = () => { date.setFullYear(date.getFullYear() + 1); sync(); };
document.getElementById("yearDown").onclick = () => { date.setFullYear(date.getFullYear() - 1); sync(); };

document.getElementById("monthUp").onclick = () => { date.setMonth(date.getMonth() + 1); sync(); };
document.getElementById("monthDown").onclick = () => { date.setMonth(date.getMonth() - 1); sync(); };

document.getElementById("dayUp").onclick = () => { date.setDate(date.getDate() + 1); sync(); };
document.getElementById("dayDown").onclick = () => { date.setDate(date.getDate() - 1); sync(); };

document.getElementById("dayIncrement").onclick = () => { date.setDate(date.getDate() + 1); sync(); };
document.getElementById("dayDecrement").onclick = () => { date.setDate(date.getDate() - 1); sync(); };

// init
sync();
