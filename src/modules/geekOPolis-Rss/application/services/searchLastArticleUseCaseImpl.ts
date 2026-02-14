import type { DiscordClient } from "../../../discordClient/discordClient.js";
import type { SearchLastArticleUseCase } from "../../adapter/in/searchLastArticleUseCase.js";
import type { CustomFeed, CustomItem } from "../models/rssTypes.js"
import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { getLocalTimeString } from '../../../../utils/timeUtils.js';

export class SearchLastArticleUseCaseImpl implements SearchLastArticleUseCase {

    private rssChannelUrl;

    private parser: Parser<CustomFeed, CustomItem>;

    private seenArticlesPath: string;

    private seenGuids: Set<string> = new Set();

    constructor(rssChannelUrl: string) {
        this.rssChannelUrl = rssChannelUrl;
        this.parser = new Parser();
        this.seenArticlesPath = path.join(process.cwd(), 'src', 'config', 'seenArticles.json');
        this.loadSeenArticles();
    }

    private loadSeenArticles(): void {
        try {
            if (fs.existsSync(this.seenArticlesPath)) {
                const data = fs.readFileSync(this.seenArticlesPath, 'utf-8');
                const parsed = JSON.parse(data);
                this.seenGuids = new Set(parsed.articles || []);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des articles vus :", error);
        }
    }

    private saveSeenArticles(): void {
        try {
            const data = JSON.stringify({ articles: Array.from(this.seenGuids) }, null, 2);
            fs.writeFileSync(this.seenArticlesPath, data, 'utf-8');
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des articles vus :", error);
        }
    }

    async checkNewArticle(): Promise<CustomItem | null> {
        try {
            console.log(`[${getLocalTimeString()}] Vérification du flux...`);
            
            const feed = await this.parser.parseURL(this.rssChannelUrl);
            const latestArticle = feed.items[0];

            if (!latestArticle) {
                console.warn("Aucun article trouvé dans le flux.");
                return null;
            }

            const currentGuid = latestArticle.guid || latestArticle.link;

            // Si l'article n'a pas encore été vu
            if (!this.seenGuids.has(currentGuid)) {
                this.seenGuids.add(currentGuid);
                this.saveSeenArticles();
                
                console.log(`[${getLocalTimeString()}] --------------------------------`)
                console.log(`[${getLocalTimeString()}] 📢 NOUVEL ARTICLE DÉTECTÉ !`);
                console.log(`[${getLocalTimeString()}] Titre : ${latestArticle.title}`);
                console.log(`[${getLocalTimeString()}] Lien  : ${latestArticle.link}`);
                console.log(`[${getLocalTimeString()}] Date  : ${latestArticle.pubDate}`);
                console.log(`[${getLocalTimeString()}] --------------------------------`)
                
                return latestArticle;
            } else {
                console.log(`[${getLocalTimeString()}] Rien de neuf sur Geek-o-polis.`);
                return null;
            }

        } catch (error) {
            console.error("Erreur lors de la récupération :", error);
            return null;
        }
    }


}
