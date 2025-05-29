const channelID = "2973244";
const readAPIKey = "8GE16Y072WWI8FCJ";
const lastURL = `https://api.thingspeak.com/channels/${channelID}/feeds/last.json?api_key=${readAPIKey}`;


// Variable pour stocker la période actuelle de l'historique
let currentHistoryPeriod = '24h';

// Créer les graphiques pour l'onglet Temps Réel (24h)
const realTimeCharts = {
    realTimeTempChart: new Chart(document.getElementById('realTimeTempChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Température (°C)', data: [], borderColor: 'red', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    realTimeHumChart: new Chart(document.getElementById('realTimeHumChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Humidité (%)', data: [], borderColor: 'blue', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    realTimePressChart: new Chart(document.getElementById('realTimePressChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Pression (hPa)', data: [], borderColor: 'green', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    realTimeAirChart: new Chart(document.getElementById('realTimeAirChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Qualité air (ppm)', data: [], borderColor: 'purple', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    realTimeLightChart: new Chart(document.getElementById('realTimeLightChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Luminosité (lux)', data: [], borderColor: 'orange', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    realTimeSoundChart: new Chart(document.getElementById('realTimeSoundChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Niveau sonore (dB)', data: [], borderColor: 'gray', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    realTimeMotionChart: new Chart(document.getElementById('realTimeMotionChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Mouvement (0/1)', data: [], borderColor: 'black', fill: false, stepped: true }] },
        options: { responsive: true, maintainAspectRatio: false }
    })
};

// Créer les graphiques pour l'onglet Historique
const charts = {
    tempChart: new Chart(document.getElementById('tempChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Température (°C)', data: [], borderColor: 'red', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    humChart: new Chart(document.getElementById('humChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Humidité (%)', data: [], borderColor: 'blue', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    pressChart: new Chart(document.getElementById('pressChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Pression (hPa)', data: [], borderColor: 'green', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    airChart: new Chart(document.getElementById('airChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Qualité air (ppm)', data: [], borderColor: 'purple', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    lightChart: new Chart(document.getElementById('lightChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Luminosité (lux)', data: [], borderColor: 'orange', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    soundChart: new Chart(document.getElementById('soundChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Niveau sonore (dB)', data: [], borderColor: 'gray', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    motionChart: new Chart(document.getElementById('motionChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Mouvement (0/1)', data: [], borderColor: 'black', fill: false, stepped: true }] },
        options: { responsive: true, maintainAspectRatio: false }
    })
};

// Fonction pour afficher/masquer le loader
function toggleLoader(show) {
    const loader = document.getElementById('loader');
    loader.classList.toggle('d-none', !show);
}

async function fetchData() {
    toggleLoader(true);
    try {
        const feedsURL = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=96`;
        const response = await fetch(feedsURL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log("Historical data (24h) for real-time tab:", data);

        if (data.feeds && data.feeds.length > 0) {
            const labels = data.feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
            const datasets = {
                field1: data.feeds.map(feed => parseFloat(feed.field1) || null),
                field2: data.feeds.map(feed => parseFloat(feed.field2) || null),
                field3: data.feeds.map(feed => parseFloat(feed.field3) || null),
                field4: data.feeds.map(feed => parseFloat(feed.field4) || null),
                field5: data.feeds.map(feed => parseFloat(feed.field5) || null),
                field6: data.feeds.map(feed => parseFloat(feed.field6) || null),
                field7: data.feeds.map(feed => parseInt(feed.field7) || null)
            };

            Object.keys(realTimeCharts).forEach(chartKey => {
                const fieldKey = chartKey.replace('realTime', '').replace('Chart', '').toLowerCase();
                const field = `field${fieldKey === 'temp' ? 1 : fieldKey === 'hum' ? 2 : fieldKey === 'press' ? 3 : fieldKey === 'air' ? 4 : fieldKey === 'light' ? 5 : fieldKey === 'sound' ? 6 : 7}`;
                realTimeCharts[chartKey].data.labels = labels;
                realTimeCharts[chartKey].data.datasets[0].data = datasets[field];
                realTimeCharts[chartKey].update();
                console.log(`Updated ${chartKey} with ${datasets[field].length} data points`);
            });
        }

        console.log("Fetching latest data from:", lastURL);
        const lastResponse = await fetch(lastURL);
        if (!lastResponse.ok) throw new Error(`HTTP error! Status: ${lastResponse.status}`);
        const lastData = await lastResponse.json();
        console.log("Latest data received:", lastData);

        const temp = parseFloat(lastData.field1) || 0;
        let tempClass = 'safe';
        if (temp > 35) tempClass = 'danger';
        else if (temp > 30) tempClass = 'warning';

        const hum = parseFloat(lastData.field2) || 0;
        let humClass = 'safe';
        if (hum < 30 || hum > 80) humClass = 'danger';
        else if (hum < 40 || hum > 60) humClass = 'warning';

        const press = parseFloat(lastData.field3) || 0;
        let pressClass = 'safe';
        if (press < 950 || press > 1070) pressClass = 'warning';
        else if (press < 900 || press > 1100) pressClass = 'danger';

        const air = parseFloat(lastData.field4) || 0;
        let airClass = 'safe';
        if (air > 1000) airClass = 'danger';
        else if (air > 800) airClass = 'warning';

        const light = parseFloat(lastData.field5) || 0;
        let lightClass = 'safe';
        if (light < 50) lightClass = 'danger';
        else if (light < 100) lightClass = 'warning';

        const sound = parseFloat(lastData.field6) || 0;
        let soundClass = 'safe';
        if (sound > 70) soundClass = 'danger';
        else if (sound > 50) soundClass = 'warning';

        const motion = lastData.field7 === '1' ? 'Détecté' : 'Non détecté';
        let motionClass = lastData.field7 === '1' ? 'danger' : 'safe';

        const comfort = parseFloat(lastData.field8) || 0;
        let comfortClass = 'safe';
        if (comfort < 50) comfortClass = 'danger';
        else if (comfort < 75) comfortClass = 'warning';

        document.getElementById('realTimeData').innerHTML = `
            <div class="row">
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card ${tempClass}">
                        <div class="card-body">
                            <p><strong>Température:</strong> ${lastData.field1 || 'N/A'}°C</p>
                        </div>
                    </div>
                    <div class="card ${humClass} mt-2">
                        <div class="card-body">
                            <p><strong>Humidité:</strong> ${lastData.field2 || 'N/A'}%</p>
                        </div>
                    </div>
                    <div class="card ${pressClass} mt-2">
                        <div class="card-body">
                            <p><strong>Pression:</strong> ${lastData.field3 || 'N/A'}hPa</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card ${airClass}">
                        <div class="card-body">
                            <p><strong>Qualité air:</strong> ${lastData.field4 || 'N/A'}ppm</p>
                        </div>
                    </div>
                    <div class="card ${lightClass} mt-2">
                        <div class="card-body">
                            <p><strong>Luminosité:</strong> ${lastData.field5 || 'N/A'}lux</p>
                        </div>
                    </div>
                    <div class="card ${soundClass} mt-2">
                        <div class="card-body">
                            <p><strong>Niveau sonore:</strong> ${lastData.field6 || 'N/A'}dB</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card ${motionClass}">
                        <div class="card-body">
                            <p><strong>Mouvement:</strong> ${motion}</p>
                        </div>
                    </div>
                    <div class="card ${comfortClass} mt-2">
                        <div class="card-body">
                            <p><strong>Confort:</strong> ${lastData.field8 || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Erreur lors de la récupération des données en temps réel:", error);
        document.getElementById('realTimeData').innerHTML = `
            <div class="alert alert-danger" role="alert">
                Erreur lors du chargement des données en temps réel : ${error.message}. Veuillez réessayer.
            </div>
        `;
    } finally {
        toggleLoader(false);
    }
}

async function fetchHistory(period = currentHistoryPeriod) {
    toggleLoader(true);
    try {
        if (period !== currentHistoryPeriod) {
            currentHistoryPeriod = period;
            console.log(`Période historique mise à jour : ${currentHistoryPeriod}`);
        }

        let numPoints;
        if (currentHistoryPeriod === '24h') numPoints = 96;
        else if (currentHistoryPeriod === '7d') numPoints = 672;
        else if (currentHistoryPeriod === '30d') numPoints = 2880;
        numPoints = Math.min(numPoints, 8000);

        const feedsURL = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=${numPoints}`;
        console.log(`Fetching historical data for ${currentHistoryPeriod} from:`, feedsURL);

        const response = await fetch(feedsURL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log("Historical data received:", data);

        if (!data.feeds || data.feeds.length === 0) {
            throw new Error("Aucune donnée historique disponible pour cette période.");
        }

        const labels = data.feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
        const datasets = {
            field1: data.feeds.map(feed => parseFloat(feed.field1) || null),
            field2: data.feeds.map(feed => parseFloat(feed.field2) || null),
            field3: data.feeds.map(feed => parseFloat(feed.field3) || null),
            field4: data.feeds.map(feed => parseFloat(feed.field4) || null),
            field5: data.feeds.map(feed => parseFloat(feed.field5) || null),
            field6: data.feeds.map(feed => parseFloat(feed.field6) || null),
            field7: data.feeds.map(feed => parseInt(feed.field7) || null)
        };
        console.log("Datasets:", datasets);

        Object.keys(charts).forEach(chartKey => {
            const fieldKey = chartKey.replace('Chart', '').toLowerCase();
            const field = `field${fieldKey === 'temp' ? 1 : fieldKey === 'hum' ? 2 : fieldKey === 'press' ? 3 : fieldKey === 'air' ? 4 : fieldKey === 'light' ? 5 : fieldKey === 'sound' ? 6 : 7}`;
            charts[chartKey].data.labels = labels;
            charts[chartKey].data.datasets[0].data = datasets[field];
            charts[chartKey].update();
            console.log(`Updated ${chartKey} with ${datasets[field].length} data points`);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des données historiques:", error);
        document.getElementById('realTimeData').innerHTML = `
            <div class="alert alert-danger" role="alert">
                Erreur lors du chargement des données historiques : ${error.message}. Veuillez réessayer.
            </div>
        `;
    } finally {
        toggleLoader(false);
    }
}

async function fetchCustomHistory() {
    toggleLoader(true);
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            throw new Error("Veuillez sélectionner une date de début et une date de fin.");
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            throw new Error("La date de fin doit être après la date de début.");
        }

        const formattedStartDate = startDate;
        const formattedEndDate = endDate;

        const feedsURL = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&start=${formattedStartDate}&end=${formattedEndDate}`;
        console.log(`Fetching custom historical data from ${formattedStartDate} to ${formattedEndDate}:`, feedsURL);

        const response = await fetch(feedsURL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log("Custom historical data received:", data);

        if (!data.feeds || data.feeds.length === 0) {
            throw new Error("Aucune donnée disponible pour la période sélectionnée.");
        }

        const labels = data.feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
        const datasets = {
            field1: data.feeds.map(feed => parseFloat(feed.field1) || null),
            field2: data.feeds.map(feed => parseFloat(feed.field2) || null),
            field3: data.feeds.map(feed => parseFloat(feed.field3) || null),
            field4: data.feeds.map(feed => parseFloat(feed.field4) || null),
            field5: data.feeds.map(feed => parseFloat(feed.field5) || null),
            field6: data.feeds.map(feed => parseFloat(feed.field6) || null),
            field7: data.feeds.map(feed => parseInt(feed.field7) || null)
        };
        console.log("Custom datasets:", datasets);

        Object.keys(charts).forEach(chartKey => {
            const fieldKey = chartKey.replace('Chart', '').toLowerCase();
            const field = `field${fieldKey === 'temp' ? 1 : fieldKey === 'hum' ? 2 : fieldKey === 'press' ? 3 : fieldKey === 'air' ? 4 : fieldKey === 'light' ? 5 : fieldKey === 'sound' ? 6 : 7}`;
            charts[chartKey].data.labels = labels;
            charts[chartKey].data.datasets[0].data = datasets[field];
            charts[chartKey].update();
            console.log(`Updated ${chartKey} with ${datasets[field].length} data points`);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des données historiques personnalisées:", error);
        document.getElementById('realTimeData').innerHTML = `
            <div class="alert alert-danger" role="alert">
                Erreur lors du chargement des données historiques personnalisées : ${error.message}. Veuillez réessayer.
            </div>
        `;
    } finally {
        toggleLoader(false);
    }
}

// Gestion du thème sombre
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark 
        ? '<i class="bi bi-sun-fill"></i> Thème Clair' 
        : '<i class="bi bi-moon-fill"></i> Thème Sombre';
    // Ajuster les couleurs des graphiques selon le thème
    Object.values(charts).forEach(chart => {
        chart.options.backgroundColor = isDark ? '#333' : '#fff';
        chart.options.borderColor = isDark ? '#fff' : '#000';
        chart.update();
    });
    Object.values(realTimeCharts).forEach(chart => {
        chart.options.backgroundColor = isDark ? '#333' : '#fff';
        chart.options.borderColor = isDark ? '#fff' : '#000';
        chart.update();
    });
});

fetchData();
setInterval(fetchData, 15000);
fetchHistory('24h');