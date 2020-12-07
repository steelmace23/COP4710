import API from './api.js';
import { validateForm } from './util.js';

const registerResponseElement = document.getElementById('register-response');
const form = document.getElementById('register-form');

/**
 * Attempts to register with the given information.
 * @param {string} username 
 * @param {string} password 
 */
const register = async (username, password) => {
    const response = await API.createUser(username, password);
    // Check for successful registration
    if (response.error) {
        throw Error(response.error);
    }
    return response;
}

// Attach a listener to the register button to enable register-related behavior
const registerButton = document.getElementById('register-button');
registerButton.addEventListener('click', async () => {
    // Check validity
    if (!validateForm(form)) {
        return;
    }

    const arrowIcon = document.getElementById('register-arrow');
    const spinner = document.getElementById('register-spinner');

    // Disable register button
    registerButton.setAttribute('disabled', true);
    arrowIcon.classList.toggle('d-none');
    spinner.classList.toggle('d-none');

    // Grab input values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Register with the given information
    try {
        const response = await register(username, password);
        console.log(response);
        
        registerResponseElement.classList.remove('alert-danger');
        registerResponseElement.classList.add('alert-success');
        registerResponseElement.innerHTML = "Account created successfully!"    
    } catch (e) {
        registerResponseElement.classList.add('alert-danger');
        registerResponseElement.classList.remove('alert-success');
        registerResponseElement.innerHTML = e.message;
    }
    registerResponseElement.classList.remove('d-none');

    // Re-enable register button
    registerButton.removeAttribute('disabled');
    arrowIcon.classList.toggle('d-none');
    spinner.classList.toggle('d-none');
});
