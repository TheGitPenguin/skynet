import { EmbedBuilder, type ChatInputCommandInteraction, type APIEmbedField, type ColorResolvable } from "discord.js";

/**
 * Simple text response
 */
export async function replySimple(interaction: ChatInputCommandInteraction, text: string, ephemeral: boolean = true): Promise<void> {
    await interaction.reply({
        content: text,
        ephemeral
    });
}

/**
 * Success message (green)
 */
export async function replySuccess(interaction: ChatInputCommandInteraction, title: string, message?: string, ephemeral: boolean = true): Promise<void> {
    const embed = new EmbedBuilder()
        .setColor("#00AA00")
        .addFields(
            { name: `✅ ${title}`, value: message || "Success" }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral });
}

/**
 * Error message (red)
 */
export async function replyError(interaction: ChatInputCommandInteraction, title: string, message?: string, ephemeral: boolean = true): Promise<void> {
    const embed = new EmbedBuilder()
        .setColor("#AA0000")
        .addFields(
            { name: `❌ ${title}`, value: message || "Error" }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral });
}

/**
 * Warning message (orange)
 */
export async function replyWarning(interaction: ChatInputCommandInteraction, title: string, message?: string, ephemeral: boolean = true): Promise<void> {
    const embed = new EmbedBuilder()
        .setColor("#FFAA00")
        .addFields(
            { name: `⚠️ ${title}`, value: message || "Warning" }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral });
}

/**
 * Info message (blue)
 */
export async function replyInfo(interaction: ChatInputCommandInteraction, title: string, message?: string, ephemeral: boolean = true): Promise<void> {
    const embed = new EmbedBuilder()
        .setColor("#0099FF")
        .addFields(
            { name: `ℹ️ ${title}`, value: message || "Information" }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral });
}

/**
 * Custom embed with fields
 */
export async function replyEmbed(
    interaction: ChatInputCommandInteraction,
    title: string,
    color: string = "#0099FF",
    fields: APIEmbedField[] = [],
    footer?: string,
    ephemeral: boolean = true
): Promise<void> {
    const embed = new EmbedBuilder()
        .setColor(color as ColorResolvable)
        .setTitle(title)
        .addFields(...fields)
        .setTimestamp();

    if (footer) {
        embed.setFooter({ text: footer });
    }

    await interaction.reply({ embeds: [embed], ephemeral });
}
