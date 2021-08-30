const apiUrl =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
const faultLineUrl =
  'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json';

function radiusSize(magnitude) {
  return magnitude * 18000;
}

function getMagColour(magnitude) {
  const color_pallette = {
    0: '#FFFF00',
    1: '#FFCC00',
    2: '#FF9900',
    3: '#FF6600',
    4: '#FF3300',
    5: '#CC3300',
  };

  const mag = Math.floor(magnitude);
  if (color_pallette[mag]) return color_pallette[mag];
  else return 'CC3300';
}

function createFeatures(earthquakeFeatures, faultLineData) {
  const earthquakes = L.geoJSON(earthquakeFeatures, {
    pointToLayer: function (earthquakeFeatures, latlng) {
      const {
        properties: { mag },
      } = earthquakeFeatures;

      return L.circle(latlng, {
        radius: radiusSize(mag),
        color: getMagColour(mag),
        fillOpacity: 1,
      });
    },
    onEachFeature: (feature, layer) => {
      const {
        properties: { title, time },
      } = feature;

      layer.bindPopup(
        `<h4 class="earth-quake-place">${title}</h4><p class="earth-quake-time">'${new Date(
          time
        )}</p>`
      );
    },
  });

  const grayscaleMap = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.outdoors',
      accessToken: API_KEY,
    }
  );

  const satelliteMap = L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.satellite',
      accessToken: API_KEY,
    }
  );

  const outdoorsMap = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.light',
      accessToken: API_KEY,
    }
  );

  let faultLine = new L.LayerGroup();

  const baseMaps = {
    'Grayscale Map': grayscaleMap,
    'Outdoor Map': outdoorsMap,
    'Satellite Map': satelliteMap,
  };

  const overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine,
  };

  const myMap = L.map('map', {
    center: [38.9637, 35.2433],
    zoom: 2,
    layers: [grayscaleMap, earthquakes, faultLine],
  });

  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);

  L.geoJSON(faultLineData, {
    style: function () {
      return { color: '#EF2828', stroke: true, weight: 1, fillOpacity: 0 };
    },
  }).addTo(faultLine);

  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const mags = [0, 1, 2, 3, 4, 5];

    mags.forEach((mag, i) => {
      const next = mags[i + 1] ? '&ndash; ' + mags[i + 1] + '<br>' : '+';
      div.innerHTML += `<div class="legend-range" style="background: ${getMagColour(
        mags[i]
      )}">${mags[i]} ${next}</div>`;
    });

    return div;
  };

  legend.addTo(myMap);
}

const app = async () => {
  const data = await d3.json(apiUrl);
  const faultLineData = await d3.json(faultLineUrl);
  const { features } = data;
  console.log(data, faultLineData);
  createFeatures(features, faultLineData);
};

app();
