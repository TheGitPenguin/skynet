import type { CronTask } from "../modules/cronScheduler/models/cronTask.js";
import type { DiscordClient } from "../modules/discordClient/discordClient.js";
import type { SearchLastArticleUseCase } from "../modules/geekOPolis-Rss/adapter/in/searchLastArticleUseCase.js";
import { formatRssDate } from "../utils/timeUtils.js";
import type { LoggerSubscriber } from "../modules/logger/logger.js";

export class NewArticle implements CronTask {
    name: string;
    schedule: string;
    task: () => Promise<void>;

    private discordClient: DiscordClient;
    private searchLastArticleUseCase: SearchLastArticleUseCase;
    private channelId: string;
    private logger: LoggerSubscriber;

    constructor(discordClient: DiscordClient, searchLastArticleUseCase: SearchLastArticleUseCase, channelId: string, logger: LoggerSubscriber) {
        this.name = "Check New Articles";
        this.schedule = "*/1 * * * *";
        this.discordClient = discordClient;
        this.searchLastArticleUseCase = searchLastArticleUseCase;
        this.channelId = channelId;
        this.logger = logger;
        this.task = this.executeTask.bind(this);
        this.logger.info('NewArticle cron task initialized.');
    }

    private async executeTask(): Promise<void> {
        try {
            this.logger.debug('Checking for new articles...');
            const newArticle = await this.searchLastArticleUseCase.checkNewArticle();

            if (newArticle) {
                this.logger.info(`New article found: "${newArticle.title}"`);
                const message = `
📰 **Nouvel Article Détecté sur Geek-o-polis!**

**Titre:** ${newArticle.title}
**Lien:** ${newArticle.link}
**Date:** ${formatRssDate(newArticle.pubDate)}
                `.trim();

                await this.discordClient.sendMessage(this.channelId, message);
                this.logger.info('New article notification sent to Discord.');
            } else {
                this.logger.debug('No new article detected.');
            }
        } catch (error) {
            this.logger.error("Error in NewArticle cron task:", error);
        }
    }
}