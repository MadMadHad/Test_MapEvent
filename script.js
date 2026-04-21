// init map
const map = L.map('map', {
  center: [25, -90], // Gulf of Mexico
  zoom: 4
});

// light basemap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

let currentLayer;

// style for events (light red fill, strong red border)
function defaultStyle() {
  return {
    color: '#cc0000',     // strong red border
    weight: 2,
    fillColor: '#ff6666', // light red fill
    fillOpacity: 0.4
  };
}

// highlight on hover
function highlightStyle() {
  return {
    color: '#ff0000',
    weight: 3,
    fillColor: '#ff4d4d',
    fillOpacity: 0.6
  };
}

// load geojson
function loadEvents(dateStr) {
  if (currentLayer) {
    map.removeLayer(currentLayer);
  }

  fetch(`data/${dateStr}.json`)
    .then(res => res.json())
    .then(data => {
      currentLayer = L.geoJSON(data, {
        style: defaultStyle,
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: e => {
              e.target.setStyle(highlightStyle());
            },
            mouseout: e => {
              currentLayer.resetStyle(e.target);
            },
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

      // zoom to event
      map.fitBounds(currentLayer.getBounds());
    });
}

// calendar
flatpickr("#calendar", {
  defaultDate: "2026-04-20",
  onChange: (selectedDates, dateStr) => {
    loadEvents(dateStr);
  }
});

// initial load
loadEvents("2026-04-20");