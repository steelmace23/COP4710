import API from './api.js';

// Async wrapper - I wish I didn't have to do this
(async () => {

    // Constants
    const user = {
        username: 'keenan',
        password: 'testing',
        user_id: 31,
        isSuperAdmin: true
    };

    const onlyActiveCheckbox = document.getElementById('only-active-checkbox');

    // Immediately create the table
    const table = new Tabulator('#admin-table', {
        layout: 'fitColumns',
        placeholder: 'No events found.',
        data: (await API.listEventsByAdmin(user, user.username, onlyActiveCheckbox.checked)).events,
        columns: [
            { title: 'Title', field: 'title' },
            { title: 'URL', field: 'url' },
            { title: 'Start Time', field: 'start_time', sorter: 'date' },
            { title: 'End Time', field: 'end_time', sorter: 'date' },
            { title: 'Location', field: 'city' }
        ]
    });

    // Active checkbox handler
    onlyActiveCheckbox.addEventListener('click', async (e) => {
        const isChecked = e.target.checked;
        
        const data = await API.listEventsByAdmin(
            user, user.username, isChecked
        );

        table.setData(data.events);
    })
})();
