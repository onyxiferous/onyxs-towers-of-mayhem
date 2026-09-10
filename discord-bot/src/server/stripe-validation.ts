/*                                                      
 ad88888ba  888888888888  ,ad8888ba,    88888888ba   88  
d8"     "8b      88      d8"'    `"8b   88      "8b  88  
Y8,              88     d8'        `8b  88      ,8P  88  
`Y8aaaaa,        88     88          88  88aaaaaa8P'  88  
  `"""""8b,      88     88          88  88""""""'    88  
        `8b      88     Y8,        ,8P  88            
Y8a     a8P      88      Y8a.    .a8P   88            
 "Y88888P"       88       `"Y8888Y"'    88           88  
                                                         
                                                
Even though this is labelled as a server-sided script, sensitive details such as tokens should
NEVER be included in these files as these are included in public branches within .gitignore.
BEFORE COMMITTING, please make sure tokens or secrets are secured and out of reach.
Use the dedicated @private path for secrets.
*/

import tokens from '@private/tokens.json' with { type: 'json' };
const stripePrivateKey = tokens.stripePrivateKey

import Stripe from 'stripe';
const stripe = new Stripe(tokens.stripePrivateKey);

app.post('/payments/create-session', async (req, res) => {
    try {
        const sessionId = req.cookies.session_id;

        if (!sessionId || !sessions.has(sessionId)) {
            return res.status(401).json({
                ok: false,
                error: 'You must be logged in.'
            });
        }

        const session = sessions.get(sessionId)!;

        const checkoutSession =
            await stripe.checkout.sessions.create({
                mode: 'payment',

                ui_mode: 'elements',

                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Neo Base',
                            },
                            unit_amount: 499,
                        },
                        quantity: 1,
                    },
                ],

                metadata: {
                    discordId: session.discordId,
                },

                return_url:
                    'https://onyxs-towers.space/bot?payment=complete',
            });

        return res.json({
            ok: true,
            clientSecret: checkoutSession.client_secret,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            ok: false,
            error: 'Could not create payment session.'
        });
    }
});