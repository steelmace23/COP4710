import API from './api.js';
import { getUser, logoutUser, eventTitleFormatter, getClickableLink } from './util.js';

// Async wrapper - I wish I didn't have to do this
(async () => {

    const user = getUser();
    if (!user) {
        window.location.href = './login.html';
    }

    // Only show the super admin link if the user is a superadmin
    if (user.is_superadmin) {
        document.getElementById('super-admin-link').classList.remove('d-none');
    }

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        logoutUser();
        window.location.href = './login.html';
    });

    const onlyActiveCheckbox = document.getElementById('only-active-checkbox');

    // Immediately create the table
    const table = new Tabulator('#admin-table', {
        layout: 'fitColumns',
        placeholder: 'No events found.',
        data: (await API.listEventsByAdmin(user, user.username, onlyActiveCheckbox.checked)).events,
        columns: [
            { title: 'Title', field: 'title', formatter: eventTitleFormatter },
            {
                title: 'URL', field: 'url', formatter: 'link', formatterParams:
                    { url: (cell) => getClickableLink(cell.getValue()), target: '_blank' }
            },
            { title: 'Start Time', field: 'start_time' },
            { title: 'End Time', field: 'end_time' },
            { title: 'Location', field: 'city' },
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
