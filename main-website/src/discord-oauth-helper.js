const params = new URLSearchParams(window.location.search);
const loginButton = document.querySelector('#discord-oauth-login')
const buttonText = loginButton.querySelector('.link-button')
const lowerPaymentSection = document.querySelector('#lower-payment-section')
const upperPaymentSection = document.querySelector('#upper-payment-section')
        const profilePicture = upperPaymentSection.querySelector('.emblem.profile-picture')

if (params.get('discord_login') === 'success') {
    window.history.replaceState(
        {},
        document.title,
        '/bot'
    );

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

        const avatarUrl = data.avatar
    ? `https://cdn.discordapp.com/avatars/${data.discordId}/${data.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

            loginButton.disabled = true;
        upperPaymentSection.setAttribute('disabled', false)
                lowerPaymentSection.removeAttribute('disabled');
                upperPaymentSection.classList.add('collapsed')
profilePicture.innerHTML = avatarUrl
buttonText.innerHTML = `for ${data.username}`
profilePicture.setAttribute('hidden', false)

    } catch (error) {
        console.error('Failed to check Discord login:', error);
    }
}