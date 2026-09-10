const authChannel = new window.BroadcastChannel("onyxs-towers-auth");

authChannel.addEventListener("message", (event) => {
	if (event.data?.type === "auth-changed") {
		window.location.reload();
	}
});