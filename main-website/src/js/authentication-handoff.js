const authChannel = new window.BroadcastChannel("onyxs-towers-auth");
const tabId = window.crypto.randomUUID();

authChannel.addEventListener("message", ({ data }) => {
	if (data?.type !== "auth-changed" || data?.source === tabId) {
		return;
	}

	window.location.reload();
});

export function notifyAuthenticationChanged() {
	authChannel.postMessage({
		type: "auth-changed",
		source: tabId
	});
}