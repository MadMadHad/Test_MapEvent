// map
const map = L.map('map', {
  center: [25, -90],
  zoom: 4
});

// base layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// search (safe attach method)
const geocoder = L.Control.geocoder();
geocoder.addTo(map);

// move search into container safely
setTimeout(() => {
  const el = geocoder.getContainer();
  document.getElementById("search").appendChild(el);
}, 0);

// layer
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

function hover(e) {
  e.target.setStyle({
    color: '#ff0000',
    fillOpacity: 0.6
  });
}

// load data
function load(dateStr) {
  if (layer) map.removeLayer(layer);

  fetch(`data/${dateStr}.json`)
    .then(r => r.json())
    .then(data => {
      layer = L.geoJSON(data, {
        style,
        onEachFeature: (f, l) => {
          l.on({
            mouseover: hover,
            mouseout: () => layer.resetStyle(l),
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
let d = new Date("2026-04-20");

function fmt(x) {
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2,'0');
  const day = String(x.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function sync() {
  document.getElementById("yearDisplay").innerText = d.getFullYear();
  document.getElementById("monthDisplay").innerText = String(d.getMonth()+1).padStart(2,'0');
  document.getElementById("dayDisplay").innerText = String(d.getDate()).padStart(2,'0');

  load(fmt(d));
}

// controls
document.getElementById("yearUp").onclick = () => { d.setFullYear(d.getFullYear()+1); sync(); };
document.getElementById("yearDown").onclick = () => { d.setFullYear(d.getFullYear()-1); sync(); };

document.getElementById("monthUp").onclick = () => { d.setMonth(d.getMonth()+1); sync(); };
document.getElementById("monthDown").onclick = () => { d.setMonth(d.getMonth()-1); sync(); };

document.getElementById("dayUp").onclick = () => { d.setDate(d.getDate()+1); sync(); };
document.getElementById("dayDown").onclick = () => { d.setDate(d.getDate()-1); sync(); };

document.getElementById("dayIncrement").onclick = () => { d.setDate(d.getDate()+1); sync(); };
document.getElementById("dayDecrement").onclick = () => { d.setDate(d.getDate()-1); sync(); };

// init
sync();
