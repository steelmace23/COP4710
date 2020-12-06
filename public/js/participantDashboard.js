import API from './api.js';

// Async wrapper - I wish I didn't have to do this
(async () => {

    // Constants
    const user = {
        username: 'keenan',
        password: 'testing',
        user_id: 31
    };

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
        columns: [
            { title: 'Title', field: 'title' },
            { title: 'URL', field: 'url' },
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
