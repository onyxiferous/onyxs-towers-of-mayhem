const input = document.querySelector(".card-number");

const loginButton = document.querySelector("#discord-oauth-login");
const buttonText = loginButton.querySelector(".link-button");
const lowerPaymentSection = document.querySelector("#lower-payment-section");
const upperPaymentSection = document.querySelector("#upper-payment-section");
const profilePicture = upperPaymentSection.querySelector(
	".emblem.profile-picture",
);

const MAX_PREVIEW_USERNAME_CHARS = 25;



export function enableLowerPaymentSection(data) {
	const profilePictureUrl = data.avatar
		? `https://cdn.discordapp.com/avatars/${data.discordId}/${data.avatar}.png`
		: `https://cdn.discordapp.com/embed/avatars/0.png`;

	upperPaymentSection.classList.add("collapsed");
	upperPaymentSection.setAttribute("disabled", true);
	lowerPaymentSection.removeAttribute("disabled");
	buttonText.firstChild.nodeValue = `for ${data.username}`.substring(0, MAX_PREVIEW_USERNAME_CHARS);
	profilePicture.src = profilePictureUrl;
	profilePicture.hidden = false;
	loginButton.disabled = true;
}

function formatCardNumber(value, delimiter) {
	delimiter = delimiter || '';
	const digitsOnly = value.replace(/\D/g, '');
	const groups = digitsOnly.match(/.{1,4}/g);
	return delimiter + groups ? delimiter + groups.join(' ') : '';
}



input.addEventListener("input", () => {
	input.value = formatCardNumber(input.value);
});