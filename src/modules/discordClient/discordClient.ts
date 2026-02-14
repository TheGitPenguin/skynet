import { Client, IntentsBitField, type ClientOptions } from "discord.js"
import type { Command } from "../../commands/command.js";

export class DiscordClient {
    private client: Client;
    private commands: Command[]

    constructor(clientOption: ClientOptions, token: string, channelIdLog: string) {
        this.client = new Client(clientOption)

        this.client.on("clientReady", async (c) => {
            console.log("Skynet see you 0_0");
            
            // await this.sendMessage(channelIdLog, "# Démarrage de SKYNET...\n1, 2, 3 ...");
        });

        this.client.on("messageCreate", (message) => {
            console.log(message.content);
        });

        this.client.login(token);

        this.commands = []
    }

    async sendMessage(channelId: string, content: string) {
        const channel = await this.client.channels.fetch(channelId);
        if (channel?.isTextBased() && 'send' in channel) {
            await channel.send(content);
        }
    }
}