import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "./command.js";
import { replySuccess } from "../utils/commandHelpers.js";

export class HelloCommand implements Command {
    data = new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Fait dire à Skynet : Bonjour");

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await replySuccess(interaction, "Bonjour 0_0", "Skynet te salue!", false);
    }
}
