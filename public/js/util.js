const getUser = () => {
    return JSON.parse(localStorage.user);
}

// Store user session in browser
const setUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
}

const logoutUser = () => {
    localStorage.removeItem('user');
}

/**
 * Validates the a form element using the Constraints API's checkValidity(),
 * then adds Bootstrap's was-validated class to enable styling.
 */
const validateForm = (formElement) => {
    let isValid = formElement.checkValidity();
    formElement.classList.add('was-validated');
    return isValid;
}

const eventTitleFormatter = (cell, formatterParams, onRendered) => {
    // Check if the event has already ended
    const event = cell.getRow().getData();
    const eventId = event.event_id;
    return `<a href=./event.html?id=${eventId} target="_blank">${event.title}</a>`;
};

const getClickableLink = link => {
    if (!link) return '';
    if (link.startsWith('http://') || link.startsWith('https://')) {
        return link;
    }
    return `http://${link}`;
};

export { getUser, setUser, logoutUser, validateForm, eventTitleFormatter, getClickableLink };
