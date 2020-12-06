/**
 * EventPortal API Library
*/

const API_PATH = (window.location.hostname === 'eventportal.para.cx') 
    ? '/api' : 'https://eventportal.para.cx/api';

// Creates the Authorization header
// This is an arrow function
const createAuthorizationHeader = (username, password) => {
    // I use template literal here
    const credential = btoa(`${username}:${password}`);
    const authValue = `Basic ${credential}`;
    return new Headers({ 'Authorization': authValue });
};

// Wrapper function on fetch to easily send authenticated requests to a path
const authenticatedRequest = async (user, path, options) => {
    const { username, password } = user;
    const response = await fetch(path, {
        ...options,
        headers: createAuthorizationHeader(username, password)
    });
    const data = await response.json();
    if (!response.ok) {
        console.error(`Error: ${data.error}`);
    }
    return data;
};

const createUser = async (username, password) => {
    const endpoint = 'createUser.php';

    const user = { username, password };
    const response = await fetch(`${API_PATH}/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(user),
    });
    const data = await response.json();
    if (!response.ok) {
        console.error(`Error: ${data.error}`);
    }
    return data;
};

const login = async (username, password) => {
    const endpoint = 'login.php';

    const user = { username, password };
    const response = await fetch(`${API_PATH}/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(user),
    });
    const data = await response.json();
    if (!response.ok) {
        console.error(`Error: ${data.error}`);
    }
    return data;
};

const createEvent = async (user, event) => {
    const endpoint = 'createEvent.php';
    const path = `${API_PATH}/${endpoint}`;

    return await authenticatedRequest(user, path, {
        method: 'POST',
        body: JSON.stringify(event)
    });
};

const getEvent = async (user, eventId) => {
    const endpoint = 'getEvent.php';
    const path = `${API_PATH}/${endpoint}?id=${eventId}`;

    return await authenticatedRequest(user, path);
};

const listEvents = async (user) => {
    const endpoint = 'listEvents.php';
    const path = `${API_PATH}/${endpoint}`;

    return await authenticatedRequest(user, path);
};

const listEventsByAdmin = async (user, admin, onlyActive = false) => {
    const endpoint = 'listEventsByAdmin.php';
    const path = `${API_PATH}/${endpoint}?username=${admin}&onlyActive=${onlyActive}`;

    return await authenticatedRequest(user, path);
};

const listEventsByCity = async (user, city) => {
    const endpoint = 'listEventsByCity.php';
    const path = `${API_PATH}/${endpoint}?city=${city}&onlyActive=true`;

    return await authenticatedRequest(user, path);
};

const listEventsByParticipant = async (user, participant) => {
    const endpoint = 'listEventsByParticipant.php';
    const path = `${API_PATH}/${endpoint}?username=${participant}`;

    return await authenticatedRequest(user, path);
};

// start and end should be strings in the format 'YYYY-MM-DD'
const listEventsByDateRange = async (user, start, end) => {
    const endpoint = 'listEventsByDateRange.php';
    const path = `${API_PATH}/${endpoint}?start=${start}&end=${end}`;

    return await authenticatedRequest(user, path);
};

const createRegistration = async (user, userId, eventId) => {
    const endpoint = 'createRegistration.php';
    const path = `${API_PATH}/${endpoint}`;

    const registration = { user_id: userId, event_id: eventId };

    return await authenticatedRequest(user, path, {
        method: 'POST',
        body: JSON.stringify(registration)
    });
};
