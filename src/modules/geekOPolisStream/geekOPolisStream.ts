import express, { type Request, type Response } from 'express';
import crypto from 'crypto';

export type StreamNotificationCallback = (streamerName: string, title: string, gameName: string) => Promise<void>;

export class GeekOPolisStream {
    private app: express.Application;
    private port: number;
    private secret: string;
    private onStreamLive: StreamNotificationCallback | undefined;

    constructor(port: number, secret: string, onStreamLive?: StreamNotificationCallback) {
        this.app = express();
        this.port = port;
        this.secret = secret;
        this.onStreamLive = onStreamLive;

        this.app.use(express.raw({ type: 'application/json' }));
        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.app.post('/geekopolis/stream', this.handleWebhook.bind(this));
    }

    private getHmacMessage(req: Request): string {
        const TWITCH_MESSAGE_ID = 'twitch-eventsub-message-id';
        const TWITCH_MESSAGE_TIMESTAMP = 'twitch-eventsub-message-timestamp';
        const messageId = req.headers[TWITCH_MESSAGE_ID] as string;
        const timestamp = req.headers[TWITCH_MESSAGE_TIMESTAMP] as string;
        const body = req.body.toString('utf8');
        return messageId + timestamp + body;
    }

    private getHmac(message: string): string {
        return crypto.createHmac('sha256', this.secret).update(message).digest('hex');
    }

    private verifyMessage(hmac: string, verifySignature: string): boolean {
        try {
            return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
        } catch {
            return false;
        }
    }

    private handleWebhook(req: Request, res: Response): void {
        const TWITCH_MESSAGE_SIGNATURE = 'twitch-eventsub-message-signature';
        const MESSAGE_TYPE = 'twitch-eventsub-message-type';
        const HMAC_PREFIX = 'sha256=';

        const message = this.getHmacMessage(req);
        const hmac = HMAC_PREFIX + this.getHmac(message);
        const twitchSignature = req.headers[TWITCH_MESSAGE_SIGNATURE] as string;

        if (!twitchSignature || !this.verifyMessage(hmac, twitchSignature)) {
            console.error('403 Forbidden: Invalid signature');
            res.sendStatus(403);
            return;
        }

        const notification = JSON.parse(req.body.toString('utf8'));
        const messageType = req.headers[MESSAGE_TYPE] as string;

        switch (messageType) {
            case 'notification':
                console.log(`Event received: ${notification.subscription.type}`);
                console.log(JSON.stringify(notification.event, null, 4));

                if (notification.subscription.type === 'stream.online' && this.onStreamLive) {
                    const event = notification.event;
                    const streamerName = event?.broadcaster_user_name ?? 'Unknown';
                    const title = event?.title ?? '';
                    const gameName = event?.game_name ?? '';
                    this.onStreamLive(streamerName, title, gameName).catch(err =>
                        console.error('Error sending stream notification:', err)
                    );
                }

                res.sendStatus(204);
                break;

            case 'webhook_callback_verification':
                console.log('Verification challenge received.');
                res.set('Content-Type', 'text/plain').status(200).send(notification.challenge);
                break;

            case 'revocation':
                console.log(`Subscription revoked: ${notification.subscription.type}`);
                console.log(`Reason: ${notification.subscription.status}`);
                res.sendStatus(204);
                break;

            default:
                console.log(`Unknown message type: ${messageType}`);
                res.sendStatus(204);
                break;
        }
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`GeekOPolis Stream webhook listening on http://localhost:${this.port}/geekopolis/stream`);
        });
    }
}