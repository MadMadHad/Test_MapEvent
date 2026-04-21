// map
const map = L.map('map', {
  center: [25, -90],
  zoom: 4
});

// base layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// search (fixed attach)
const geocoder = L.Control.geocoder();
geocoder.addTo(map);

setTimeout(() => {
  document.getElementById("search").appendChild(geocoder.getContainer());
}, 0);

// layer
let layer;

// styles
function baseStyle() {
  return {
    color: '#cc0000',
    weight: 2,
    fillColor: '#ff6666',
    fillOpacity: 0.4
  };
}

function hoverStyle(e) {
  e.target.setStyle({
    color: '#ff0000',
    fillOpacity: 0.6
  });
}

// load events (NO zoom change)
function load(dateStr) {
  if (layer) map.removeLayer(layer);

  fetch(`data/${dateStr}.json`)
    .then(r => r.json())
    .then(data => {
      layer = L.geoJSON(data, {
        style: baseStyle,
        onEachFeature: (f, l) => {
          l.on({
            mouseover: hoverStyle,
            mouseout: () => layer.resetStyle(l),
            click: e => {
              const wiki = "https://en.wikipedia.org/wiki/Special:Random";

              L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                  <b>${f.properties.title}</b><br/>
                  ${f.properties.description}<br/><br/>
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
