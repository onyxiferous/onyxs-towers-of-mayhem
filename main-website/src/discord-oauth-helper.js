const params = new URLSearchParams(window.location.search);
const loginButton = document.querySelector('#discord-oauth-login')
const lowerPaymentSection = document.querySelector('#lower-payment-section')
const upperPaymentSection = document.querySelector('#upper-payment-section')

if (params.get('discord_login') === 'success') {
    // Remove the query parameter from the address bar
    window.history.replaceState(
        {},
        document.title,
        '/bot'
    );

    // Ask the API for the logged-in Discord user
    loadDiscordUser();
}

async function loadDiscordUser() {
    try {
        const response = await fetch(
            'https://api.onyxs-towers.space/auth/me',
            {
                credentials: 'include'
            }
        );

const text = await response.text();

console.log('API status:', response.status);
console.log('API response:', text);

const data = JSON.parse(text);

        if (!data.loggedIn) {
            console.log('Not logged in');
            return;
        }

        loginButton.disabled = true;
        upperPaymentSection.disabled = true;
        lowerPaymentSection.disabled = false;
        loginButton.innerHTML = `Hi ${data.username}`

    } catch (error) {
        console.error('Failed to check Discord login:', error);
    }
}