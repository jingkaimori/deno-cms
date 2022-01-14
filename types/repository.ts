export type Site = {
    articles:Article[],
}

export type Article = ArticleLocal | ArticleRemote
export type ArticleLocal = {
    path:string,
}
export type ArticleRemote = never;// unimplemented stub