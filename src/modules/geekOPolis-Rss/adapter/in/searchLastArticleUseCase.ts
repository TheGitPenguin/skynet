import type { CustomItem } from "../../application/models/rssTypes.js";

export interface SearchLastArticleUseCase {
    checkNewArticle(): Promise<CustomItem | null>;
}