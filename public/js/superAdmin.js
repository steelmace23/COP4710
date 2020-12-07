import API from './api.js';
import { getUser, logoutUser } from './util.js';

// Async wrapper - I wish I didn't have to do this
(async () => {

    // Redirect the user to the login page if they're not logged in
    const user = getUser();
    if (!user) {
        window.location.href = './login.html';
    }

    // Redirect the user to the participant page if they aren't a superadmin
    if (!user.is_superadmin) {
        window.location.href = './participant.html'
    }

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        logoutUser();
        window.location.href = './login.html';
    });

    // Immediately create the table
    const table = new Tabulator('#super-admin-table', {
        layout: 'fitColumns',
        placeholder: 'No events found.',
        data: (await API.listEvents(user, false, user.user_id)).events,
        columns: [
            { title: 'ID', field: 'event_id', width: 50 },
            { title: 'Title', field: 'title' },
            {
                title: 'URL', field: 'url', formatter: 'link', formatterParams:
                    { urlPrefix: 'http://', target: '_blank' }
            },
            { title: 'Start Time', field: 'start_time' },
            { title: 'End Time', field: 'end_time' },
            { title: 'Location', field: 'city' },
        ]
    });

    // -- Handlers --
    // Search by time range
    const startDateElement = document.getElementById('start-date');
    const endDateElement = document.getElementById('end-date');
    const searchDateRangeButton = document.getElementById('search-date-range');
    searchDateRangeButton.addEventListener('click', async (e) => {
        const data = await API.listEventsByDateRange(
            user, startDateElement.value, endDateElement.value, user.user_id
        );

        // Display an error if one occurred. Otherwise, remove the error.
        if (data.error) {
            document.getElementById('error-alert').classList.remove('d-none');
            document.getElementById('error-message').innerText = data.error;
            return;
        }
        document.getElementById('error-alert').classList.add('d-none');

        table.setData(data.events);
    });

    // Search by city 
    const cityElement = document.getElementById('city');
    const searchCityButton = document.getElementById('search-city');
    searchCityButton.addEventListener('click', async (e) => {
        const data = await API.listEventsByCity(
            user, cityElement.value, user.user_id
        );

        // Display an error if one occurred. Otherwise, remove the error.
        if (data.error) {
            document.getElementById('error-alert').classList.remove('d-none');
            document.getElementById('error-message').innerText = data.error;
            return;
        }
        document.getElementById('error-alert').classList.add('d-none');

        table.setData(data.events);
    });
})();
