import type { SearchLastArticleUseCase } from "./adapter/in/searchLastArticleUseCase.js";
import { SearchLastArticleUseCaseImpl } from "./application/services/searchLastArticleUseCaseImpl.js";
import type { LoggerSubscriber } from "../logger/logger.js";

export class GeekOPolisRssComponent {
    public searchLastArticleUseCase: SearchLastArticleUseCase;

    constructor(rssChannelUrl: string, savePath: string, logger: LoggerSubscriber) {
        this.searchLastArticleUseCase = new SearchLastArticleUseCaseImpl(rssChannelUrl, savePath, logger);
    }
}