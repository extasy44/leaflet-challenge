const apiUrl =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

const app = async () => {
  const data = await d3.json(apiUrl);
  const { features } = data;
  console.log(data);
  createFeatures(features);
};

app();
