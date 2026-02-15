import { IntentsBitField, type ClientOptions } from "discord.js";
import config from "./config.json" with { type: "json" }
import { DiscordClient } from "./modules/discordClient/discordClient.js";
import { GeekOPolisRssComponent } from "./modules/geekOPolis-Rss/geekOPolis-Rss-Component.js";
import { CronScheduler } from "./modules/cronScheduler/cronScheduler.js";
import { NewArticle } from "./cronTasks/newArticle.js";
import { PingCommand } from "./commands/ping.js";
import { HelloCommand } from "./commands/hello.js";
import { HelpCommand } from "./commands/help.js";
import { WelcomeMemberAdd } from "./memberAdd/welcome.js";
const { token, channelId, channelIdLog, channelRss, channelNewArticle, clientId, guildId, welcomeChannel } = config;

const clientOptions: ClientOptions = {
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
    ]
};

const discordClient: DiscordClient = new DiscordClient(
    clientOptions,
    token,
    channelIdLog,
    guildId,
    welcomeChannel
);

// Register regular commands
discordClient.registerCommands([
    new PingCommand(),
    new HelloCommand()
]);

discordClient.registerMemberAdds([
    new WelcomeMemberAdd(discordClient, welcomeChannel)
]);

// Create and register HelpCommand with access to all commands
const helpCommand = new HelpCommand(discordClient);
discordClient.registerCommand(helpCommand);

// Deploy commands globally on startup
(async () => {
    await discordClient.deployCommands(clientId, guildId);
})();

const geekOPolisRssComponent: GeekOPolisRssComponent = new GeekOPolisRssComponent(channelRss);

const cronScheduler: CronScheduler = new CronScheduler([
    new NewArticle(
        discordClient,
        geekOPolisRssComponent.searchLastArticleUseCase,
        channelNewArticle
    )
]);