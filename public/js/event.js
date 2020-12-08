import API from './api.js';
import { getUser, logoutUser, getClickableLink } from './util.js';

const API_KEY = 'AIzaSyAOuR-9F5jTi3cDj6T46C6DyBp3mXxaisw';

const displayEvent = (event) => {
    document.getElementById('title').innerText = event.title;
    document.getElementById('url').innerText = event.url;
    document.getElementById('url').href = getClickableLink(event.url);
    document.getElementById('description').innerText = event.description;
    document.getElementById('start-time').innerText = event.start_time;
    document.getElementById('end-time').innerText = event.end_time;

    const formattedAddress = `${event.address}
    ${(event.address2) ? event.address2 : ''}
    ${event.city}, ${event.state} ${event.postal_code}`;

    document.getElementById('address').innerText = formattedAddress;

    const mapQuery = encodeURIComponent(`${event.address}, ${event.city}, ${event.state} ${event.postal_code}`);
    document.getElementById('map').innerHTML = `<iframe
        width="100%"
        height="450"
        frameborder="0" style="border:0"
        src="https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${mapQuery}" allowfullscreen>
        </iframe>`;
}

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

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    // Redirect back to the participant page if there's no eventId in the url
    if (!eventId) {
        window.location.href = './participant.html';
    }

    // Immediately fetch and display the event
    const event = (await API.getEvent(user, eventId)).event;
    displayEvent(event);
})();
