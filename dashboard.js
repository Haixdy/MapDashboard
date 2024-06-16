document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map
    var map = L.map('map').setView([3.1390, 101.6869], 10); // Center on Selangor

    // Set up the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a legend to the map
    addLegend(map);

    // Fetch and process the CSV data
    fetchCSVData('https://yourusername.github.io/yourrepository/data.csv')
        .then(csvText => {
            const rows = parseCSVData(csvText);
            rows.forEach((data, index) => {
                if (isValidLatLng(data.lat, data.lng)) {
                    const color = getColor(data.value);
                    addCircleToMap(map, data.lat, data.lng, color, 100, data.value); // 100 meters radius
                } else {
                    logDebugInfo(index, data);
                }
            });
        })
        .catch(error => console.error('Error fetching the CSV data:', error));
});

function fetchCSVData(url) {
    return fetch(url)
        .then(response => response.text());
}

function parseCSVData(csvText) {
    return csvText
        .split('\n')
        .slice(1) // Skip the header
        .map(row => {
            const [lat, lng, value] = row.split(',').map(item => item.trim());
            return { lat: parseFloat(lat), lng: parseFloat(lng), value: parseFloat(value) };
        });
}

function isValidLatLng(lat, lng) {
    return !isNaN(lat) && !isNaN(lng);
}

function addCircleToMap(map, lat, lng, color, radius, value) {
    const circle = L.circle([lat, lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.7,
        radius: radius // Radius in meters
    }).addTo(map);

    // Bind tooltip to show lat, lng, and value
    circle.bindTooltip(`Lat: ${lat}<br>Lng: ${lng}<br>Value: ${value}`, { permanent: false, direction: 'top' });
}

function getColor(value) {
    // Interpolate between green (0) and red (10)
    const green = [0, 255, 0]; // RGB for green
    const red = [255, 0, 0]; // RGB for red
    const ratio = Math.min(Math.max(value / 10, 0), 1); // Ensure ratio is between 0 and 1

    const r = Math.round(green[0] + ratio * (red[0] - green[0]));
    const g = Math.round(green[1] + ratio * (red[1] - green[1]));
    const b = Math.round(green[2] + ratio * (red[2] - green[2]));

    return `rgb(${r},${g},${b})`;
}

function logDebugInfo(index, data) {
    console.error(`Invalid LatLng object at row ${index + 1}: (${data.lat}, ${data.lng})`);
}

function addLegend(map) {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 2, 4, 6, 8, 10];
        const labels = [];

        // Loop through density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            const from = grades[i];
            const to = grades[i + 1];
            labels.push(
                '<i style="background:' + getColor(from + 1) + '; width: 18px; height: 18px; display: inline-block;"></i> ' +
                from + (to ? '&ndash;' + to : '+')
            );
        }

        div.innerHTML = '<h4>Value Range</h4>' + labels.join('<br>');
        div.style.fontSize = '18px';  // Increase the font size for better visibility
        return div;
    };

    legend.addTo(map);
}
