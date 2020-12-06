// Async wrapper - I wish I didn't have to do this
(async () => {

    // Constants
    const user = {
        username: 'keenan',
        password: 'testing'
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
            { title: 'Location', field: 'city' }
        ]
    });

    // -- Handlers --
    // Search by time range
    const startDateElement = document.getElementById('start-date');
    const endDateElement = document.getElementById('end-date');
    const searchDateRangeButton = document.getElementById('search-date-range');
    searchDateRangeButton.addEventListener('click', async (e) => {
        const data = await listEventsByDateRange(
            user, startDateElement.value, endDateElement.value
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
        const data = await listEventsByCity(
            user, cityElement.value
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
