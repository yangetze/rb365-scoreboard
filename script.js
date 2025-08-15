// **IMPORTANTE**: Reemplaza esta URL con la que obtuviste de Google Sheets
const sheetUrl = './puntuacion.csv';

// Función para obtener y procesar los datos
async function fetchSheetData() {
    try {
        const response = await fetch(sheetUrl);
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.trim()).filter(row => row);

        // Asumiendo que la primera fila son los encabezados
        const headers = rows[0].split(',');
        const dataRows = rows.slice(1);

        const usersData = {};

        // Determinar el índice de la columna 'Nombre'
        const nameColumnIndex = headers.indexOf('Nombre');

        dataRows.forEach(row => {
            const values = row.split(',');
            const userName = values[nameColumnIndex]; // Usa el índice de la columna 'Nombre'

            if (!userName || userName.trim() === '') return; // Ignorar filas sin nombre

            if (!usersData[userName]) {
                usersData[userName] = { totalPoints: 0, details: [] };
            }

            // Iterar desde la quinta columna (índice 4) en adelante para los eventos
            for (let i = 4; i < values.length; i++) {
                const eventName = headers[i];
                const points = parseInt(values[i]);

                if (!isNaN(points) && points > 0) {
                    usersData[userName].totalPoints += points;
                    usersData[userName].details.push({ event: eventName, points: points });
                }
            }
        });

        const sortedUsers = Object.keys(usersData).sort((a, b) => usersData[b].totalPoints - usersData[a].totalPoints);

        displayLeaderboard(sortedUsers, usersData);
        setupDetailsDisplay(usersData);

    } catch (error) {
        console.error('Hubo un error al cargar los datos:', error);
        alert('No se pudieron cargar los datos. Por favor, revisa la URL de la hoja de cálculo.');
    }
}

// ... El resto de las funciones (displayLeaderboard, setupDetailsDisplay, showUserDetails)
//    permanecen sin cambios. Puedes copiarlas directamente del código anterior.

// Función para mostrar la tabla de clasificación
function displayLeaderboard(sortedUsers, usersData) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '';

    sortedUsers.forEach((userName, index) => {
        const row = document.createElement('tr');
        row.dataset.userName = userName; // Almacenamos el nombre para el clic

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${userName}</td>
            <td>${usersData[userName].totalPoints}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

// Función para configurar la visualización de los detalles
function setupDetailsDisplay(usersData) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const userDetailsDiv = document.getElementById('user-details');
    const closeBtn = document.getElementById('close-btn');

    leaderboardBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row) {
            const userName = row.dataset.userName;
            showUserDetails(userName, usersData[userName]);
        }
    });

    closeBtn.addEventListener('click', () => {
        userDetailsDiv.style.display = 'none';
    });
}

// Función para mostrar los detalles de un usuario
function showUserDetails(userName, userData) {
    const userDetailsDiv = document.getElementById('user-details');
    const userNameElement = document.getElementById('user-name');
    const userTotalPointsElement = document.getElementById('user-total-points');
    const pointsList = document.getElementById('points-list');

    userNameElement.textContent = `Detalles de ${userName}`;
    userTotalPointsElement.textContent = `Puntos Totales: ${userData.totalPoints}`;

    pointsList.innerHTML = '';
    userData.details.forEach(detail => {
        const listItem = document.createElement('li');
        listItem.textContent = `${detail.event}: ${detail.points} puntos`;
        pointsList.appendChild(listItem);
    });

    userDetailsDiv.style.display = 'block';
}

// Iniciar la carga de datos al cargar la página
document.addEventListener('DOMContentLoaded', fetchSheetData);