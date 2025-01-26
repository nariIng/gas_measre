let poids = [];
let temps = [];
let titre = 0;

function dPhGraphique(poids, temps) {
    const ctx = document.getElementById('titration-curve').getContext('2d');

    const data = {
        labels: temps,
        datasets: [{
            label: 'Masse en fonction du temps',
            data: poids,
            borderColor: 'rgb(6, 78, 42)',
            borderWidth: 2,
            fill: false,
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Temps (minutes)',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Masse',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    };

    if (window.dPhGraphiqueInstance) {
        window.dPhGraphiqueInstance.data.labels = temps;
        window.dPhGraphiqueInstance.data.datasets[0].data = poids;
        window.dPhGraphiqueInstance.update();
    } else {
        window.dPhGraphiqueInstance = new Chart(ctx, config);
    }
}

function start_test() {
    fetch(`/start_test?text=${titre}`);
}

function start_titre() {
    titre = 1;
    fetch(`/start_receiv?text=${titre}`);
}

function end_titre() {
    titre = 0;
    fetch(`/start_receiv?text=${titre}`);
}

async function fetch_poids() {
    try {
        const [response, titre_stat] = await Promise.all ([
            fetch('/poids'),
            fetch('/start_send')
        ]);
        if (!response.ok) {
            throw new Error('Erreur réseau lors de la récupération des données');
        }
        const data = await response.json();
        titre = await titre_stat.json();
        poids = data.poids;
        temps = data.temps;

        if (titre == 1) {
            dPhGraphique(poids, temps);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    }
}

async function sendMessage(event) {
    event.preventDefault();

    titre = 1;
    start_titre();

    try {
        const start = await fetch(`/start`);
        if (!start.ok) {
            console.error('Erreur lors de l\'envoi de la vitesse de la pompe:', start.statusText);
        }
    } catch (error) {
        console.error('Erreur lors du commencement:', error);
    }
}

async function test(event) {
    event.preventDefault();
    start_test();
}

setInterval(fetch_poids, 1000);
