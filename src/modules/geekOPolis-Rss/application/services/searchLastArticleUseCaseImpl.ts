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

    constructor(rssChannelUrl: string, savePath: string) {
        this.rssChannelUrl = rssChannelUrl;
        this.parser = new Parser();
        this.seenArticlesPath = savePath;
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
            console.error("Error loading seen articles:", error);
        }
    }

    private saveSeenArticles(): void {
        try {
            const data = JSON.stringify({ articles: Array.from(this.seenGuids) }, null, 2);
            fs.writeFileSync(this.seenArticlesPath, data, 'utf-8');
        } catch (error) {
            console.error("Error saving seen articles:", error);
        }
    }

    async checkNewArticle(): Promise<CustomItem | null> {
        try {
            console.log(`[${getLocalTimeString()}] Checking feed...`);
            
            const feed = await this.parser.parseURL(this.rssChannelUrl);
            const latestArticle = feed.items[0];

            if (!latestArticle) {
                console.warn("No articles found in feed.");
                return null;
            }

            const currentGuid = latestArticle.guid || latestArticle.link;

            // If article has not been seen yet
            if (!this.seenGuids.has(currentGuid)) {
                this.seenGuids.add(currentGuid);
                this.saveSeenArticles();
                
                console.log(`[${getLocalTimeString()}] --------------------------------`)
                console.log(`[${getLocalTimeString()}] 📢 NEW ARTICLE DETECTED!`);
                console.log(`[${getLocalTimeString()}] Title: ${latestArticle.title}`);
                console.log(`[${getLocalTimeString()}] Link : ${latestArticle.link}`);
                console.log(`[${getLocalTimeString()}] Date : ${latestArticle.pubDate}`);
                console.log(`[${getLocalTimeString()}] --------------------------------`)
                
                return latestArticle;
            } else {
                console.log(`[${getLocalTimeString()}] Nothing new on Geek-o-polis.`);
                return null;
            }

        } catch (error) {
            console.error("Error retrieving feed:", error);
            return null;
        }
    }


}
