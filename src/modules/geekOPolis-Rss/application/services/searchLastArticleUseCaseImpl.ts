import type { SearchLastArticleUseCase } from "../../adapter/in/searchLastArticleUseCase.js";
import type { CustomFeed, CustomItem } from "../models/rssTypes.js"
import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import type { LoggerSubscriber } from '../../../logger/logger.js';

export class SearchLastArticleUseCaseImpl implements SearchLastArticleUseCase {

    private rssChannelUrl;

    private parser: Parser<CustomFeed, CustomItem>;

    private seenArticlesPath: string;

    private seenGuids: Set<string> = new Set();

    private logger: LoggerSubscriber;

    constructor(rssChannelUrl: string, savePath: string, logger: LoggerSubscriber) {
        this.rssChannelUrl = rssChannelUrl;
        this.parser = new Parser();
        this.seenArticlesPath = savePath;
        this.logger = logger;
        this.logger.info(`RSS feed URL: ${rssChannelUrl}`);
        this.logger.info(`Seen articles file: ${savePath}`);
        this.loadSeenArticles();
    }

    private loadSeenArticles(): void {
        try {
            if (fs.existsSync(this.seenArticlesPath)) {
                const data = fs.readFileSync(this.seenArticlesPath, 'utf-8');
                const parsed = JSON.parse(data);
                this.seenGuids = new Set(parsed.articles || []);
                this.logger.info(`Loaded ${this.seenGuids.size} seen article(s) from cache.`);
            } else {
                this.logger.info('No seen articles cache found, starting fresh.');
            }
        } catch (error) {
            this.logger.error("Error loading seen articles:", error);
        }
    }

    private saveSeenArticles(): void {
        try {
            const data = JSON.stringify({ articles: Array.from(this.seenGuids) }, null, 2);
            fs.writeFileSync(this.seenArticlesPath, data, 'utf-8');
            this.logger.debug(`Saved ${this.seenGuids.size} seen article(s) to cache.`);
        } catch (error) {
            this.logger.error("Error saving seen articles:", error);
        }
    }

    async checkNewArticle(): Promise<CustomItem | null> {
        try {
            this.logger.info(`Checking feed at ${this.rssChannelUrl}...`);
            
            const feed = await this.parser.parseURL(this.rssChannelUrl);
            this.logger.debug(`Feed parsed: ${feed.items.length} item(s) found.`);
            const latestArticle = feed.items[0];

            if (!latestArticle) {
                this.logger.warn("No articles found in feed.");
                return null;
            }

            const currentGuid = latestArticle.guid || latestArticle.link;

            // If article has not been seen yet
            if (!this.seenGuids.has(currentGuid)) {
                this.seenGuids.add(currentGuid);
                this.saveSeenArticles();
                
                this.logger.info(`--------------------------------`);
                this.logger.info(`📢 NEW ARTICLE DETECTED!`);
                this.logger.info(`Title: ${latestArticle.title}`);
                this.logger.info(`Link : ${latestArticle.link}`);
                this.logger.info(`Date : ${latestArticle.pubDate}`);
                this.logger.info(`--------------------------------`);
                
                return latestArticle;
            } else {
                this.logger.info(`Nothing new on Geek-o-polis.`);
                return null;
            }

        } catch (error) {
            this.logger.error("Error retrieving feed:", error);
            return null;
        }
    }


}
