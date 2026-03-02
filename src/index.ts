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
import { GeekOPolisStream } from "./modules/geekOPolisStream/geekOPolisStream.js";
import { Logger } from "./modules/logger/logger.js";
const { saveDirectory, logDirectory, token, portTwitch, twitchSecret, channelId, channelIdLog, channelRss, channelNewArticle, clientId, guildId, welcomeChannel, streamChannel } = config;

const logger = new Logger(logDirectory);
const mainLogger = logger.subscribe('Main');

mainLogger.info('Initializing SKYNET...');
mainLogger.info(`Save directory: ${saveDirectory}`);
mainLogger.info(`Log directory: ${logDirectory}`);

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
    welcomeChannel,
    logger.subscribe('DiscordClient')
);

// Register regular commands
mainLogger.info('Registering commands: ping, hello...');
discordClient.registerCommands([
    new PingCommand(),
    new HelloCommand()
]);

mainLogger.info('Registering member add handlers: welcome...');
discordClient.registerMemberAdds([
    new WelcomeMemberAdd(discordClient, welcomeChannel)
]);

// Create and register HelpCommand with access to all commands
mainLogger.info('Registering command: help...');
const helpCommand = new HelpCommand(discordClient);
discordClient.registerCommand(helpCommand);

// Deploy commands globally on startup
mainLogger.info('Deploying slash commands...');
(async () => {
    await discordClient.deployCommands(clientId, guildId);
    mainLogger.info('Slash commands deployment complete.');
})();

mainLogger.info('Initializing GeekOPolis RSS component...');
const geekOPolisRssComponent: GeekOPolisRssComponent = new GeekOPolisRssComponent(channelRss, saveDirectory + "seenArticles.json", logger.subscribe('GeekOPolisRss'));
mainLogger.info('GeekOPolis RSS component initialized.');

//const geekOPolisStream = new GeekOPolisStream(portTwitch, twitchSecret, logger.subscribe('GeekOPolisStream'), async (streamerName, title, gameName) => {
//    const message = `🔴 **${streamerName}** est en live !\n🎮 ${gameName}\n📺 ${title}\nhttps://www.twitch.tv/${streamerName.toLowerCase()}`;
//    await discordClient.sendMessage(streamChannel, message);
//});
//geekOPolisStream.start();

mainLogger.info('Initializing CronScheduler...');
const cronScheduler: CronScheduler = new CronScheduler(logger.subscribe('CronScheduler'), [
    new NewArticle(
        discordClient,
        geekOPolisRssComponent.searchLastArticleUseCase,
        channelNewArticle,
        logger.subscribe('NewArticle')
    )
]);
mainLogger.info('SKYNET fully initialized and running.');