if (!localStorage.user) {
    window.location.href = './login.html';
} else {
    window.location.href = './participant.html';
}
