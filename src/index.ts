import { IntentsBitField, type ClientOptions } from "discord.js";
import config from "./config.json" with { type: "json" }
import { DiscordClient } from "./modules/discordClient/discordClient.js";
import { GeekOPolisRssComponent } from "./modules/geekOPolis-Rss/geekOPolis-Rss-Component.js";
import { CronScheduler } from "./modules/cronScheduler/cronScheduler.js";
import { NewArticle } from "./cronTasks/newArticle.js";
const { token, channelId, channelIdLog, channelRss, channelNewArticle } = config


const clientOption: ClientOptions = {
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
    ]
}   

const discordClient: DiscordClient = new DiscordClient(clientOption, token, channelIdLog);
const geekOPolisRssComponent: GeekOPolisRssComponent = new GeekOPolisRssComponent(channelRss);

const cronScheduler: CronScheduler = new CronScheduler([
    new NewArticle(
        discordClient,
        geekOPolisRssComponent.searchLastArticleUseCase,
        channelNewArticle
    )
])