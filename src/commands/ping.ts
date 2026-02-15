import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "./command.js";
import { replySimple } from "../utils/commandHelpers.js";

export class PingCommand implements Command {
    data = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Teste la latence du bot");

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await replySimple(interaction, `🏓 Pong! Latence: ${interaction.client.ws.ping}ms`);
    }
}
