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
Use the dedicated @private path for secrets. */

import express, { Request, Response, json } from 'express';
import cors from 'cors';

import { logApi, logSection } from '@modules/logger.js';
import tokens from '@private/tokens.json' with { type: 'json' };
const { robloxApiKey } = tokens

let isNginxListening = false;
const app = express();

app.use(cors({
    origin: 'https://onyxs-towers.space'
}))

app.use(json());

const websiteClients = new Set<Response>();

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