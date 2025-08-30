
// generated with help of ChatGPT and Reddit
function switchTheme() {
    const body = document.body;
    const toggleButton = document.querySelector('.toggle-button');
    const themeName = document.getElementById('theme-name');

    body.classList.toggle('dark-mode');
    toggleButton.classList.toggle('active');

    if (body.classList.contains('dark-mode')) {
        themeName.textContent = 'Dark';
    } else {
        themeName.textContent = 'Light';
    }
}