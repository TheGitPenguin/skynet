import { Client, IntentsBitField, type ClientOptions, REST, Routes, type ChatInputCommandInteraction, GuildMember } from "discord.js"
import type { Command } from "../../commands/command.js";
import { getLocalTimeString } from "../../utils/timeUtils.js";
import type { MemberAdd } from "../../memberAdd/memberAdd.js";
import type { LoggerSubscriber } from "../logger/logger.js";

export class DiscordClient {
    private client: Client;
    private commands: Map<string, Command> = new Map();
    private memberAdds: Map<string, MemberAdd> = new Map();
    private token: string;
    private logger: LoggerSubscriber;

    constructor(
        clientOptions: ClientOptions, 
        token: string, 
        logChannelId: string, 
        guildId: string, 
        welcomeChannel: string,
        logger: LoggerSubscriber
    ) {
        this.client = new Client(clientOptions);
        this.token = token;
        this.logger = logger;

        this.logger.info('Initializing Discord client...');

        this.client.on("clientReady", async (c) => {
            this.logger.info(`Logged in as ${c.user.tag} (${c.user.id})`);
            this.logger.info("Skynet see you 0_0");
            
            await this.sendMessage(logChannelId, "# Démarrage de SKYNET...\n1, 2, 3 ...");
        });

        this.client.on("interactionCreate", async (interaction) => {
            if (interaction.isChatInputCommand()) {
                this.logger.info(`Command received: /${interaction.commandName} by ${interaction.user.tag}`);
                await this.handleCommand(interaction);
            }
        });

        this.client.on("guildMemberAdd", async (guildMember) => {
            this.logger.info(`New member joined: ${guildMember.user.tag} (guild: ${guildMember.guild.id})`);
            if (guildMember.guild.id != guildId) {
                this.logger.debug(`Ignoring member add from different guild: ${guildMember.guild.id}`);
                return;
            }

            await this.handleGuildMemberAdd(guildMember)
        });

        this.logger.info('Connecting to Discord...');
        this.client.login(token);
    }

    public registerCommand(command: Command): void {
        this.logger.debug(`Registering command: /${command.data.name}`);
        this.commands.set(command.data.name, command);
    }

    public registerCommands(commands: Command[]): void {
        for (const command of commands) {
            this.registerCommand(command);
        }
    }

    public registerMemberAdd(memberAdd: MemberAdd): void {
        this.logger.debug(`Registering member add handler: ${memberAdd.name}`);
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
                this.logger.error("The Client Id is not found");
                return;
            }

            if (guildId) {
                // Deploy commands on a specific server (faster deployment)
                this.logger.info(`Deploying commands on server ${guildId}...`);
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commandsData }
                );
            } else {
                // Deploy globally
                this.logger.info("Deploying commands globally...");
                await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: commandsData }
                );
            }
            
            this.logger.info(`✅ ${commandsData.length} commands deployed successfully.`);
        } catch (error) {
            this.logger.error("Error deploying commands:", error);
        }
    }

    private async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            this.logger.warn(`Unknown command: ${interaction.commandName}`);
            await interaction.reply({
                content: "❌ Commande inconnue.",
                ephemeral: true
            });
            return;
        }

        try {
            await command.execute(interaction);
            this.logger.info(`Command /${interaction.commandName} executed successfully by ${interaction.user.tag}`);
        } catch (error) {
            this.logger.error(`Error executing command ${interaction.commandName}:`, error);
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
        this.logger.info(`Processing member add handlers for ${guildMember.user.tag}...`);
        for (const memberAdd of this.memberAdds) {
            this.logger.debug(`Executing member add handler: ${memberAdd[0]}`);
            memberAdd[1].execute(guildMember);
        }
    }

    async sendMessage(channelId: string, content: string) {
        this.logger.debug(`Sending message to channel ${channelId}`);
        const channel = await this.client.channels.fetch(channelId);
        if (channel?.isTextBased() && 'send' in channel) {
            await channel.send(content);
            this.logger.debug(`Message sent to channel ${channelId}`);
        } else {
            this.logger.warn(`Channel ${channelId} not found or not text-based`);
        }
    }
}