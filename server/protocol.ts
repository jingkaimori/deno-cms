import { plainDocument } from "../types/data.ts";
import { retrieve, update } from "./types.ts"
import { RemoteContent, RemoteHash, RemoteValue } from "../types/repository.ts";

type serverFunctions = {
    [_: string]: (...t: (RemoteValue|RemoteHash)[]) => void
}

let testarticle:plainDocument = {name:"",childs:[],raw:"",auxilary:{}}

type webinterface = {
    readArticle:retrieve<plainDocument>
    updateArticle:update<plainDocument>
}

const server:webinterface = {
    readArticle:()=>{
        return testarticle
    },
    updateArticle:()=>{
        return;
    }
}

type lowconnect = {
    receive: ReadableStream<string>
    send: (msg:string)=>void
}

class Server<T extends RemoteContent> {
    #handler:T;
    constructor(handler:T) {
        this.#handler = handler
    }

    listen(){

    }
}