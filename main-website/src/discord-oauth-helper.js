const params = new URLSearchParams(window.location.search);

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

        const data = await response.json();

        if (!data.loggedIn) {
            console.log('Not logged in');
            return;
        }

        console.log('Logged in as:', data.username);
        console.log('Discord ID:', data.discordId);

        alert('logged in')

    } catch (error) {
        console.error('Failed to check Discord login:', error);
    }
}