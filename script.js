// Configuration de l'accès à ThingSpeak
const channelID = "2973244";
const readAPIKey = "8GE16Y072WWI8FCJ";
const lastURL = `https://api.thingspeak.com/channels/${channelID}/feeds/last.json?api_key=${readAPIKey}`;

// Variables globales
let currentHistoryPeriod = '24h'; // Période par défaut pour l'historique
let isFetching = false; // État pour éviter les requêtes simultanées

// Initialisation des graphiques pour l'onglet Temps Réel (24h)
const realTimeCharts = {};
['Temp', 'Hum', 'Press', 'Air', 'Light', 'Sound', 'Motion'].forEach(type => {
    const canvas = document.getElementById(`realTime${type}Chart`);
    if (canvas) {
        // Création d'un graphique pour chaque champ avec Chart.js
        realTimeCharts[`realTime${type}Chart`] = new Chart(canvas.getContext('2d'), {
            type: 'line', // Type de graphique (ligne)
            data: {
                labels: Array(96).fill(''), // 96 points pour 24h (15min intervalle)
                datasets: [{
                    label: `${type === 'Temp' ? 'Température (°C)' : type === 'Hum' ? 'Humidité (%)' : type === 'Press' ? 'Pression (hPa)' : type === 'Air' ? 'Qualité air (ppm)' : type === 'Light' ? 'Luminosité (lux)' : type === 'Sound' ? 'Niveau sonore (dB)' : 'Mouvement (0/1)'}`,
                    data: Array(96).fill(null), // Données initiales vides
                    borderColor: type === 'Temp' ? 'red' : type === 'Hum' ? 'blue' : type === 'Press' ? 'green' : type === 'Air' ? 'purple' : type === 'Light' ? 'orange' : type === 'Sound' ? 'gray' : 'black', // Couleurs distinctes
                    fill: false,
                    stepped: type === 'Motion' // Graphique en étapes pour le mouvement
                }]
            },
            options: {
                responsive: true, // Adaptatif à la taille de l'écran
                maintainAspectRatio: false // Permet de fixer la hauteur
            }
        });
    } else {
        console.error(`Canvas with id 'realTime${type}Chart' not found`);
    }
});

// Initialisation des graphiques pour l'onglet Historique
const charts = {};
['Temp', 'Hum', 'Press', 'Air', 'Light', 'Sound', 'Motion'].forEach(type => {
    const canvas = document.getElementById(`${type.toLowerCase()}Chart`);
    if (canvas) {
        charts[`${type.toLowerCase()}Chart`] = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: Array(96).fill(''),
                datasets: [{
                    label: `${type === 'Temp' ? 'Température (°C)' : type === 'Hum' ? 'Humidité (%)' : type === 'Press' ? 'Pression (hPa)' : type === 'Air' ? 'Qualité air (ppm)' : type === 'Light' ? 'Luminosité (lux)' : type === 'Sound' ? 'Niveau sonore (dB)' : 'Mouvement (0/1)'}`,
                    data: Array(96).fill(null),
                    borderColor: type === 'Temp' ? 'red' : type === 'Hum' ? 'blue' : type === 'Press' ? 'green' : type === 'Air' ? 'purple' : type === 'Light' ? 'orange' : type === 'Sound' ? 'gray' : 'black',
                    fill: false,
                    stepped: type === 'Motion'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else {
        console.error(`Canvas with id '${type.toLowerCase()}Chart' not found`);
    }
});

// Fonction pour afficher ou masquer le loader
function toggleLoader(show) {
    const loader = document.getElementById('loader');
    loader.classList.toggle('d-none', !show); // Affiche/masque le spinner
}

// Fonction pour retirer les classes skeleton une fois les données chargées
function removeSkeletons() {
    document.querySelectorAll('.skeleton, .canvas-skeleton').forEach(element => {
        element.classList.remove('skeleton', 'canvas-skeleton'); // Retire l'effet de chargement
    });
}

// Fonction pour réessayer une requête en cas d'échec
async function fetchWithRetry(url, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error; // Échec après toutes les tentatives
            console.warn(`Échec de la requête, tentative ${i + 1}/${retries}...`, error);
            await new Promise(resolve => setTimeout(resolve, delay)); // Attente avant la prochaine tentative
        }
    }
}

// Fonction pour récupérer et afficher les données en temps réel
async function fetchData() {
    if (isFetching) return; // Évite les appels simultanés
    isFetching = true;
    toggleLoader(true); // Affiche le loader
    try {
        // Récupération des données historiques (24h) pour les graphiques
        const feedsURL = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=96`;
        const data = await fetchWithRetry(feedsURL);
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

            // Mise à jour des graphiques Temps Réel
            Object.keys(realTimeCharts).forEach(chartKey => {
                const fieldKey = chartKey.replace('realTime', '').replace('Chart', '').toLowerCase();
                const field = `field${fieldKey === 'temp' ? 1 : fieldKey === 'hum' ? 2 : fieldKey === 'press' ? 3 : fieldKey === 'air' ? 4 : fieldKey === 'light' ? 5 : fieldKey === 'sound' ? 6 : 7}`;
                realTimeCharts[chartKey].data.labels = labels;
                realTimeCharts[chartKey].data.datasets[0].data = datasets[field];
                realTimeCharts[chartKey].update();
                console.log(`Updated ${chartKey} with ${datasets[field].length} data points`);
            });
        }

        // Récupération des dernières données
        console.log("Fetching latest data from:", lastURL);
        const lastData = await fetchWithRetry(lastURL);
        console.log("Latest data received:", lastData);

        // Calcul des classes CSS pour les indicateurs visuels
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

        // Mise à jour de l'interface avec les dernières données
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
        removeSkeletons(); // Retire les skeletons une fois les données chargées
    } catch (error) {
        // Gestion des erreurs (ex. coupure réseau)
        console.error("Erreur lors de la récupération des données en temps réel:", error);
        document.getElementById('realTimeData').innerHTML = `
            <div class="alert alert-danger" role="alert">
                Erreur lors du chargement des données en temps réel : ${error.message}. Veuillez réessayer.
            </div>
        `;
        removeSkeletons(); // Retire les skeletons même en cas d'erreur
    } finally {
        toggleLoader(false); // Masque le loader
        isFetching = false; // Permet les prochaines requêtes
    }
}

// Fonction pour récupérer les données historiques
async function fetchHistory(period = currentHistoryPeriod) {
    if (isFetching) return;
    isFetching = true;
    toggleLoader(true);
    try {
        if (period !== currentHistoryPeriod) {
            currentHistoryPeriod = period;
            console.log(`Période historique mise à jour : ${currentHistoryPeriod}`);
        }

        // Calcul du nombre de points en fonction de la période
        let numPoints;
        if (currentHistoryPeriod === '24h') numPoints = 96;
        else if (currentHistoryPeriod === '7d') numPoints = 672;
        else if (currentHistoryPeriod === '30d') numPoints = 2880;
        numPoints = Math.min(numPoints, 8000); // Limite de ThingSpeak

        const feedsURL = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=${numPoints}`;
        console.log(`Fetching historical data for ${currentHistoryPeriod} from:`, feedsURL);

        const data = await fetchWithRetry(feedsURL);
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


        // Mise à jour des graphiques Historique
        Object.keys(charts).forEach(chartKey => {
            const fieldKey = chartKey.replace('Chart', '').toLowerCase();
            const field = `field${fieldKey === 'temp' ? 1 : fieldKey === 'hum' ? 2 : fieldKey === 'press' ? 3 : fieldKey === 'air' ? 4 : fieldKey === 'light' ? 5 : fieldKey === 'sound' ? 6 : 7}`;
            charts[chartKey].data.labels = labels;
            charts[chartKey].data.datasets[0].data = datasets[field];
            charts[chartKey].update();
            console.log(`Updated ${chartKey} with ${datasets[field].length} data points`);
        });
        removeSkeletons();
    } catch (error) {
        console.error("Erreur lors de la récupération des données historiques:", error);
        document.getElementById('realTimeData').innerHTML = `
            <div class="alert alert-danger" role="alert">
                Erreur lors du chargement des données historiques : ${error.message}. Veuillez réessayer.
            </div>
        `;
        removeSkeletons();
    } finally {
        toggleLoader(false);
        isFetching = false;
    }
}

// Fonction pour récupérer les données historiques sur une période personnalisée
async function fetchCustomHistory() {
    if (isFetching) return;
    isFetching = true;
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

        const data = await fetchWithRetry(feedsURL);
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

        Object.keys(charts).forEach(chartKey => {
            const fieldKey = chartKey.replace('Chart', '').toLowerCase();
            const field = `field${fieldKey === 'temp' ? 1 : fieldKey === 'hum' ? 2 : fieldKey === 'press' ? 3 : fieldKey === 'air' ? 4 : fieldKey === 'light' ? 5 : fieldKey === 'sound' ? 6 : 7}`;
            charts[chartKey].data.labels = labels;
            charts[chartKey].data.datasets[0].data = datasets[field];
            charts[chartKey].update();
            console.log(`Updated ${chartKey} with ${datasets[field].length} data points`);
        });
        removeSkeletons();
    } catch (error) {
        console.error("Erreur lors de la récupération des données historiques personnalisées:", error);
        document.getElementById('realTimeData').innerHTML = `
            <div class="alert alert-danger" role="alert">
                Erreur lors du chargement des données historiques personnalisées : ${error.message}. Veuillez réessayer.
            </div>
        `;
        removeSkeletons();
    } finally {
        toggleLoader(false);
        isFetching = false;
    }
}

// Gestion du basculement entre thème sombre et clair
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode'); // Bascule la classe dark-mode
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark 
        ? '<i class="bi bi-sun-fill"></i> Thème Clair' 
        : '<i class="bi bi-moon-fill"></i> Thème Sombre'; // Met à jour l'icône et le texte
    // Ajuste les couleurs des graphiques selon le thème
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

// Appels initiaux pour charger les données au démarrage
fetchData(); // Charge les données en temps réel
fetchHistory('24h'); // Charge l'historique initial (24h)
setInterval(fetchData, 15000); // Met à jour les données toutes les 30 secondes