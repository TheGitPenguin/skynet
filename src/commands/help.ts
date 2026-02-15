import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "./command.js";
import type { DiscordClient } from "../modules/discordClient/discordClient.js";
import { replyEmbed } from "../utils/commandHelpers.js";

export class HelpCommand implements Command {
    data = new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche la liste des commandes disponibles");

    private discordClient: DiscordClient;

    constructor(discordClient: DiscordClient) {
        this.discordClient = discordClient;
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const commands = this.discordClient.getCommands();
        
        const fields = Array.from(commands.values()).map(command => ({
            name: `/${command.data.name}`,
            value: command.data.description || "Pas de description"
        }));

        await replyEmbed(
            interaction,
            "📚 Commandes disponibles",
            "#0099FF",
            fields,
            "Skynet Discord Bot"
        );
    }
}
