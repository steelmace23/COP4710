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

export { getUser, setUser, logoutUser, validateForm };
