import API from './api.js';
import { getUser, logoutUser, eventTitleFormatter } from './util.js';

// Async wrapper - I wish I didn't have to do this
(async () => {

    // Redirect the user to the login page if they're not logged in
    const user = getUser();
    if (!user) {
        window.location.href = './login.html';
    }

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        logoutUser();
        window.location.href = './login.html';
    });

    // Only show the super admin link if the user is a superadmin
    if (user.is_superadmin) {
        document.getElementById('super-admin-link').classList.remove('d-none');
    }

    const createRegistrationButton = (onClick, registered, disabled) => {
        const button = document.createElement('button');

        // Set attributes
        button.type = 'button';
        const buttonStyle = (registered) ? 'btn-success' : 'btn-outline-danger';
        button.classList.add('col', 'btn', 'btn-sm', buttonStyle);
        button.innerText = (registered) ? '✔ Registered' : '❌ Unregistered';

        if (disabled) {
            button.disabled = true;
        }

        button.addEventListener('click', onClick);
        return button;
    };

    const onClickRegister = async (cell) => {
        const eventId = cell.getRow().getData().event_id;
        await API.createRegistration(user, user.user_id, eventId);
        cell.setValue(true);
    }

    const onClickUnregister = async (cell) => {
        const eventId = cell.getRow().getData().event_id;
        await API.unregisterFromEvent(user, user.user_id, eventId);
        cell.setValue(false);
    }

    const registerFormatter = (cell, formatterParams, onRendered) => {
        // Check if the event has already ended
        const rowData = cell.getRow().getData();
        const endDate = Date.parse(rowData.end_time.replace(' ', 'T'));
        const eventIsOver = Date.now() > endDate;

        const isRegistered = cell.getValue();

        if (isRegistered === undefined) {
            return 'Not logged in';
        }

        let onClick;
        if (isRegistered) {
            onClick = () => onClickUnregister(cell);
        } else {
            onClick = () => onClickRegister(cell);
        }
        return createRegistrationButton(onClick, isRegistered, eventIsOver);
    };

    // Immediately create the table
    const table = new Tabulator('#participant-table', {
        layout: 'fitColumns',
        placeholder: 'No events found.',
        data: (await API.listEvents(user, false, user.user_id)).events,
        columns: [
            { title: 'Title', field: 'title', formatter: eventTitleFormatter },
            {
                title: 'URL', field: 'url', formatter: 'link', formatterParams:
                    { urlPrefix: 'http://', target: '_blank' }
            },
            { title: 'Start Time', field: 'start_time', sorter: 'date' },
            { title: 'End Time', field: 'end_time', sorter: 'date' },
            { title: 'Location', field: 'city' },
            { title: 'Registered', field: 'registered', formatter: registerFormatter }
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
