import { plainDocument } from "../types/data.ts";
import { status } from "../types/errors.ts";
import { Server, webSocket2Channel } from "./protocol.ts";
import { retrieve, update } from "./types.ts";

let testarticle:plainDocument = {name:"",childs:[],raw:"",auxilary:{}}

export type webinterface = {
    readArticle:retrieve<plainDocument>
    updateArticle:update<plainDocument>
}

const serverfunc:webinterface = {
    readArticle:(id)=>{
        console.log(id)
        // if(id.at(0) == 255){
        //     return status.RESOURCE_NOT_FOUND
        // }
        return testarticle
    },
    updateArticle:(content)=>{
        testarticle = content
        return;
    }
}


const conn = Deno.listen({
    port: 8400
});
const httpConn = Deno.serveHttp(await conn.accept());
const e = await httpConn.nextRequest();
if (e) {
  const { socket, response } = Deno.upgradeWebSocket(e.request);
  e.respondWith(response);
  try{
    console.log("current socket detail:\n"
    + " socket object: " + socket  + "\n" 
    + " socket state: " + socket.readyState + "\n"
    + " socket url: " + socket.url)
    const channel = await webSocket2Channel(socket)
    const server = new Server(serverfunc)
    server.listen(channel);
    }catch(err){
        console.log(err)
    }
}