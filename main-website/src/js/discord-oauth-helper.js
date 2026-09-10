import { enableLowerPaymentSection } from "./payment-handler.js";

const URLSearchParams = window.URLSearchParams;
const params = new URLSearchParams(window.location.search);

async function loadDiscordUser() {
	try {
		const response = await fetch("https://api.onyxs-towers.space/auth/me", {
			credentials: "include",
		});

		const text = await response.text();
		const data = JSON.parse(text);

		if (!data.loggedIn) {
			return;
		} 

		enableLowerPaymentSection();
	} catch (error) {
		window.alert("Oops! Something went wrong while trying to log in: ", error);
	}
}

if (params.get("discord_login") === "success") {
	window.history.replaceState({}, document.title, "/bot");

	const channel = new window.BroadcastChannel("onyxs-towers-auth");

	channel.postMessage({
		type: "auth-changed"
	});

	channel.close();
	loadDiscordUser();
}