import API from './api.js';
import { eventTitleFormatter, getUser, logoutUser, getClickableLink } from './util.js';

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

    // Show the user's name in the top right
    const usernameNavElement = document.getElementById('username-nav');
    const usernameElement = document.getElementById('username');
    usernameElement.innerText = user.username;
    usernameNavElement.classList.remove('d-none');
    
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

    // -- Handlers --
    // Search by admin username 
    const adminUsernameElement = document.getElementById('admin-username');
    const searchAdminButton = document.getElementById('search-admin');
    searchAdminButton.addEventListener('click', async (e) => {
        const data = await API.listEventsByAdmin(
            user, adminUsernameElement.value, false
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
    const participantUsernameElement = document.getElementById('participant-username');
    const searchParticipantButton = document.getElementById('search-participant');
    searchParticipantButton.addEventListener('click', async (e) => {
        const data = await API.listEventsByParticipant(
            user, participantUsernameElement.value
        );

        // Display an error if one occurred. Otherwise, remove the error.
        if (data.error) {
            document.getElementById('error-alert').classList.remove('d-none');
            document.getElementById('error-message').innerText = data.error;
            return;
        }
        document.getElementById('error-alert').classList.add('d-none');

        table.setData(data);
    });
})();
