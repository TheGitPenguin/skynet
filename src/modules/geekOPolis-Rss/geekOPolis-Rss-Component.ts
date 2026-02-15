import type { SearchLastArticleUseCase } from "./adapter/in/searchLastArticleUseCase.js";
import { SearchLastArticleUseCaseImpl } from "./application/services/searchLastArticleUseCaseImpl.js";

export class GeekOPolisRssComponent {
    public searchLastArticleUseCase: SearchLastArticleUseCase;

    constructor(rssChannelUrl: string) {
        this.searchLastArticleUseCase = new SearchLastArticleUseCaseImpl(rssChannelUrl);
    }
}