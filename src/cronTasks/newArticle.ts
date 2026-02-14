import type { CronTask } from "../modules/cronScheduler/models/cronTask.js";
import type { DiscordClient } from "../modules/discordClient/discordClient.js";
import type { SearchLastArticleUseCase } from "../modules/geekOPolis-Rss/adapter/in/searchLastArticleUseCase.js";
import { formatRssDate } from "../utils/timeUtils.js";

export class NewArticle implements CronTask {
    name: string;
    schedule: string;
    task: () => Promise<void>;

    private discordClient: DiscordClient;
    private searchLastArticleUseCase: SearchLastArticleUseCase;
    private channelId: string;

    constructor(discordClient: DiscordClient, searchLastArticleUseCase: SearchLastArticleUseCase, channelId: string) {
        this.name = "Check New Articles";
        this.schedule = "*/1 * * * *"; // Toutes les 10 minutes
        this.discordClient = discordClient;
        this.searchLastArticleUseCase = searchLastArticleUseCase;
        this.channelId = channelId;
        this.task = this.executeTask.bind(this);
    }

    private async executeTask(): Promise<void> {
        try {
            const newArticle = await this.searchLastArticleUseCase.checkNewArticle();

            if (newArticle) {
                const message = `
📰 **Nouvel Article Détecté sur Geek-o-polis!**

**Titre:** ${newArticle.title}
**Lien:** ${newArticle.link}
**Date:** ${formatRssDate(newArticle.pubDate)}
                `.trim();

                await this.discordClient.sendMessage(this.channelId, message);
            }
        } catch (error) {
            console.error("Erreur dans la tâche cron NewArticle :", error);
        }
    }
}