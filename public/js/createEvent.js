import API from './api.js';
import { getUser, validateForm } from './util.js';

// Async wrapper - I wish I didn't have to do this
(async () => {

    // Redirect the user to the login page if they're not logged in
    const user = getUser();
    if (!user) {
        window.location.href = './login.html';
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

    // Only show the super admin link if the user is a superadmin
    if (user.is_superadmin) {
        document.getElementById('super-admin-link').classList.remove('d-none');
    }
})();

const user = getUser();

const createEventResponseElement = document.getElementById('create-event-response');
const form = document.getElementById('create-event-form');

// Attach a listener to the create event button to enable event creation behavior
const createEventButton = document.getElementById('create-event-button');
createEventButton.addEventListener('click', async () => {
    // Check validity
    if (!validateForm(form)) {
        return;
    }

    const plusIcon = document.getElementById('create-event-plus');
    const spinner = document.getElementById('create-event-spinner');

    // Disable create event button
    createEventButton.setAttribute('disabled', true);
    plusIcon.classList.toggle('d-none');
    spinner.classList.toggle('d-none');

    // Transform the dates and times into datetimes
    const startDate = document.getElementById('start-date').value;
    const startTime = document.getElementById('start-time').value;
    const startDateTime = `${startDate}T${startTime}:00Z`;
    const endDate = document.getElementById('end-date').value;
    const endTime = document.getElementById('end-time').value;
    const endDateTime = `${endDate}T${endTime}:00Z`;


    // Grab input values
    const event = {
        admin_id: user.user_id,
        title: document.getElementById("event-title").value,
        description: document.getElementById("description").value,
        url: document.getElementById("url").value,
        start_time: startDateTime,
        end_time: endDateTime,
        address: document.getElementById("address").value,
        address2: document.getElementById("address-2").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        postal_code: document.getElementById("postal-code").value
    }

    // Create an event with the given information
    const response = await API.createEvent(user, event);
    console.log(response);

    if (response.error) {
        createEventResponseElement.classList.add('alert-danger');
        createEventResponseElement.classList.remove('alert-success');
        createEventResponseElement.innerText = `Error: ${response.error}`;
    } else {
        createEventResponseElement.classList.remove('alert-danger');
        createEventResponseElement.classList.add('alert-success');
        createEventResponseElement.innerText = "Event created successfully!"
    }

    createEventResponseElement.classList.remove('d-none');

    // Re-enable create event button
    createEventButton.removeAttribute('disabled');
    plusIcon.classList.toggle('d-none');
    spinner.classList.toggle('d-none');
});


