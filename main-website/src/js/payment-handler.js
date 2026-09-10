const stripe = window.Stripe("pk_test_51U9d1KEYRUcOAksD808BsnWb81xjRnb3dQyc4gxZuI5XVqXRBuOd745fgfpnMQZ5wLOlITlTmyF0A53AckOGN6NR001u92U4Ka");

const loginButton =
    document.querySelector("#discord-oauth-login");

const buttonText =
    loginButton.querySelector(".link-button");

const lowerPaymentSection =
    document.querySelector("#lower-payment-section");

const upperPaymentSection =
    document.querySelector("#upper-payment-section");

const profilePicture =
    upperPaymentSection.querySelector(
    	".emblem.profile-picture",
    );

const purchaseButton =
    document.querySelector("#purchase-button");

const paymentError =
    document.querySelector("#payment-error");

const promoInput =
    document.querySelector("#promo");

const MAX_PREVIEW_USERNAME_CHARS = 25;

let checkout = null;
let paymentElement = null;


export async function enableLowerPaymentSection(data) {
	const profilePictureUrl = data.avatar
		? `https://cdn.discordapp.com/avatars/${data.discordId}/${data.avatar}.png`
		: `https://cdn.discordapp.com/embed/avatars/0.png`;

	upperPaymentSection.classList.add("collapsed");
	upperPaymentSection.setAttribute("disabled", true);

	lowerPaymentSection.removeAttribute("disabled");

	buttonText.firstChild.nodeValue =
        `for ${data.username}`.substring(
        	0,
        	MAX_PREVIEW_USERNAME_CHARS,
        );

	profilePicture.src = profilePictureUrl;
	profilePicture.hidden = false;

	loginButton.setAttribute("aria-disabled", "true");
	loginButton.classList.add("disabled");

	await initializeStripe();
}


async function initializeStripe() {
	try {
		const response = await fetch(
			"https://api.onyxs-towers.space/payments/create-session",
			{
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		const data = await response.json();

		if (!response.ok || !data.ok) {
			throw new Error(
				data.error ||
                "Could not initialize payment.",
			);
		}

		checkout = stripe.initCheckoutElementsSdk({
			clientSecret: data.clientSecret,
		});

		paymentElement =
            checkout.createPaymentElement();

		paymentElement.mount(
			"#stripe-payment-element",
		);

	} catch (error) {
		console.error(error);

		showPaymentError(
			"Could not load the payment form.",
		);
	}
}


purchaseButton.addEventListener("click", async () => {
	if (!checkout) {
		showPaymentError(
			"The payment form is not ready yet.",
		);

		return;
	}

	purchaseButton.disabled = true;
	paymentError.hidden = true;

	try {
		const loadActionsResult =
            await checkout.loadActions();

		if (loadActionsResult.type !== "success") {
			throw new Error(
				"Could not start the payment.",
			);
		}

		const { actions } = loadActionsResult;

		const result = await actions.confirm();

		if (result.error) {
			throw new Error(
				result.error.message,
			);
		}

	} catch (error) {
		console.error(error);

		showPaymentError(
			error.message ||
            "Payment could not be completed.",
		);

		purchaseButton.disabled = false;
	}
});


function showPaymentError(message) {
	paymentError.textContent = message;
	paymentError.hidden = false;
}