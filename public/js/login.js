import API from './api.js';
import { setUser, validateForm } from './util.js';

const loginResponseElement = document.getElementById('login-response');
const form = document.getElementById('login-form');

// Attach a listener to the login button to enable login-related behavior
const loginButton = document.getElementById('login-button');
loginButton.addEventListener('click', async () => {
    // Check validity
    if (!validateForm(form)) {
        return;
    }

    const arrowIcon = document.getElementById('login-arrow');
    const spinner = document.getElementById('login-spinner');

    // Disable login button
    loginButton.setAttribute('disabled', true);
    arrowIcon.classList.toggle('d-none');
    spinner.classList.toggle('d-none');

    // Grab username and password from the inputs
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Login with the given credentials
        const response = await API.login(username, password);
    
        // Check for successful login
        if (response.error) {
            throw Error(response.error);
        }

        console.log(response);
        const user = { ...(response.data), password };
        setUser(user);

        // Redirect the user to the participant dashboard
        window.location.href = "./participant.html";
        return;
    } catch(e) {
        // Report error message
        console.log(e.message);
        loginResponseElement.innerHTML = e.message;
        loginResponseElement.classList.remove('d-none');
    
        // Re-enable login button
        loginButton.removeAttribute('disabled');
        arrowIcon.classList.toggle('d-none');
        spinner.classList.toggle('d-none');
    }
});
