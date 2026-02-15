import { Client, IntentsBitField, type ClientOptions, REST, Routes, type ChatInputCommandInteraction, GuildMember } from "discord.js"
import type { Command } from "../../commands/command.js";
import { getLocalTimeString } from "../../utils/timeUtils.js";
import type { MemberAdd } from "../../memberAdd/memberAdd.js";

export class DiscordClient {
    private client: Client;
    private commands: Map<string, Command> = new Map();
    private memberAdds: Map<string, MemberAdd> = new Map();
    private token: string;

    constructor(
        clientOptions: ClientOptions, 
        token: string, 
        logChannelId: string, 
        guildId: string, 
        welcomeChannel: string
    ) {
        this.client = new Client(clientOptions)
        this.token = token;

        this.client.on("clientReady", async (c) => {
            console.log("Skynet see you 0_0");
            
            await this.sendMessage(logChannelId, "# Démarrage de SKYNET...\n1, 2, 3 ...");
        });

        this.client.on("interactionCreate", async (interaction) => {
            if (interaction.isChatInputCommand()) {
                await this.handleCommand(interaction);
            }
        });

        this.client.on("guildMemberAdd", async (guildMember) => {
            console.log(guildMember.guild.id)
            if (guildMember.guild.id != guildId) {
                return;
            }

            await this.handleGuildMemberAdd(guildMember)
        });

        this.client.login(token);
    }

    public registerCommand(command: Command): void {
        this.commands.set(command.data.name, command);
    }

    public registerCommands(commands: Command[]): void {
        for (const command of commands) {
            this.registerCommand(command);
        }
    }

    public registerMemberAdd(memberAdd: MemberAdd): void {
        this.memberAdds.set(memberAdd.name, memberAdd);
    }

    public registerMemberAdds(memberAdds: MemberAdd[]): void {
        for (const memberAdd of memberAdds) {
            this.registerMemberAdd(memberAdd);
        }
    }

    public getCommands(): Map<string, Command> {
        return this.commands;
    }

    public async deployCommands(clientId?: string, guildId?: string): Promise<void> {
        try {
            const commandsData = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());
            
            const rest = new REST({ version: '10' }).setToken(this.token);

            if (!clientId) {
                console.log("The Client Id is not found");
                return;
            }

            if (guildId) {
                // Deploy commands on a specific server (faster deployment)
                console.log(`Deploying commands on server ${guildId}...`);
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commandsData }
                );
            } else {
                // Deploy globally
                console.log("Deploying commands globally...");
                await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: commandsData }
                );
            }
            
            console.log(`✅ ${commandsData.length} commands deployed successfully.`);
        } catch (error) {
            console.error("Error deploying commands:", error);
        }
    }

    private async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            console.warn(`Unknown command: ${interaction.commandName}`);
            await interaction.reply({
                content: "❌ Commande inconnue.",
                ephemeral: true
            });
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing command ${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "❌ Une erreur est survenue lors de l'exécution de la commande.",
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: "❌ Une erreur est survenue lors de l'exécution de la commande.",
                    ephemeral: true
                });
            }
        }
    }

    private async handleGuildMemberAdd(guildMember: GuildMember) {
        for (const memberAdd of this.memberAdds) {
            memberAdd[1].execute(guildMember);
        }
    }

    async sendMessage(channelId: string, content: string) {
        const channel = await this.client.channels.fetch(channelId);
        if (channel?.isTextBased() && 'send' in channel) {
            await channel.send(content);
        }
    }
}