export type Site = {
    articles: Article[],
}

export type Remote<T> = {
    [key in keyof T]: Remote<T[key]>
}

export type RemoteValue =
  | { [key: string]: RemoteValue | RemoteHash | Uint8Array }
  | RemoteValue[]
  | string
  | number
  | boolean
  | null;

export type RemoteHash<T extends RemoteValue = null> = Uint8Array;

export type RemoteContent<T extends RemoteValue = null> = T | RemoteHash<T>

export type Article = ArticleLocal | ArticleRemote
export type ArticleLocal = {
    path:string,
}
export type ArticleRemote = never;// unimplemented stub