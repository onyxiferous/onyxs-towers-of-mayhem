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

import express, { Request, Response, json } from 'express';
import cors from 'cors';

import crypto from 'node:crypto';
import { logApi, logSection } from '@modules/logger.js';
import tokens from '@private/tokens.json' with { type: 'json' };
const { robloxApiKey, clientId, token } = tokens

const DISCORD_CALLBACK =
    'https://api.onyxs-towers.space/auth/discord/callback';

const sessions = new Map<string, {
    discordId: string;
    username: string;
}>();

let isNginxListening = false;
const app = express();

app.use(cors({
    origin: 'https://onyxs-towers.space'
}))

app.use(json());

const websiteClients = new Set<Response>();

app.get('/auth/discord', (req, res) => {
    const state = crypto.randomBytes(32).toString('hex');

    res.cookie('discord_oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
    });

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: DISCORD_CALLBACK,
        scope: 'identify',
        state,
    });

    res.redirect(
        `https://discord.com/oauth2/authorize?${params.toString()}`
    );
});

app.get('/auth/discord/callback', async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (
        typeof code !== 'string' ||
        typeof state !== 'string'
    ) {
        return res.status(400).send('Invalid Discord callback.');
    }

    if (state !== req.cookies.discord_oauth_state) {
        return res.status(400).send('Invalid OAuth state.');
    }

    res.clearCookie('discord_oauth_state');

    try {
        const tokenBody = new URLSearchParams({
            client_id: clientId,
            client_secret: token,
            grant_type: 'authorization_code',
            code,
            redirect_uri: DISCORD_CALLBACK,
        });

        const tokenResponse = await fetch(
            'https://discord.com/api/v10/oauth2/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded',
                },
                body: tokenBody,
            }
        );

        if (!tokenResponse.ok) {
            const error = await tokenResponse.text();

            logApi(`Discord token exchange failed: ${error}`);

            return res.status(401).send(
                'Could not authenticate with Discord.'
            );
        }

        const tokenData = await tokenResponse.json();

        const userResponse = await fetch(
            'https://discord.com/api/v10/users/@me',
            {
                headers: {
                    Authorization:
                        `Bearer ${tokenData.access_token}`,
                },
            }
        );

        if (!userResponse.ok) {
            return res.status(401).send(
                'Could not retrieve Discord account.'
            );
        }

        const user = await userResponse.json();

        const sessionId = crypto
            .randomBytes(32)
            .toString('hex');

        sessions.set(sessionId, {
            discordId: user.id,
            username: user.username,
        });

        res.cookie('session_id', sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        logApi(
            `Discord login: ${user.username} (${user.id})`
        );

        return res.redirect(
            'https://onyxs-towers.space/bot?discord_login=success'
        );

    } catch (error) {
        console.error(error);

        return res.status(500).send(
            'Discord authentication failed.'
        );
    }
});

app.get('/website/tower-wins', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.flushHeaders();

    websiteClients.add(res);

    logApi(
        `Website connected to tower-win events (${websiteClients.size} clients)`
    );

    res.write('event: connected\n');
    res.write(`data: ${JSON.stringify({ ok: true })}\n\n`);

    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 15000);

    req.on('close', () => {
        clearInterval(heartbeat);
        websiteClients.delete(res);

        logApi(
            `Website disconnected from tower-win events (${websiteClients.size} clients)`
        );
    });
});

const API_PORT = 3000;
const ROBLOX_API_KEY = robloxApiKey

app.get('/bot/messages', (req, res) => {
    const type = req.get('Type');

    if (!ROBLOX_API_KEY || req.get('X-Roblox-Key') !== ROBLOX_API_KEY) {
        return res.status(401).json({
            ok: false,
            error: 'Unauthorized'
        });
    }

    if (type === 'join') {
        return onTowerWin(req, res);
    }

    return res.status(400).json({
        ok: false,
        error: 'Unknown message type'
    });
});

function onTowerWin(_req: Request, res: Response) {
    logApi('Tower win received!');

    for (const client of websiteClients) {
        client.write('event: towerWin\n');
        client.write(`data: ${JSON.stringify({
            timestamp: Date.now()
        })}\n\n`);
    }

    return res.json({
        ok: true,
        message: 'winmsg'
    });
}


function startListeningIp(ip: string, port = API_PORT) {
    app.listen(port, ip, () => {
        logSection('API port connected!')
        logApi(`Started listening on ${ip}:${port} [TCP/HTTP]`)
        isNginxListening = true;
    });
}

function getNginxListening() {
    return isNginxListening;
}

export { startListeningIp, getNginxListening }