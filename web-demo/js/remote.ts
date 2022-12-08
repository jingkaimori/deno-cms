import { Client, webSocket2Channel } from "../../server/protocol.ts";
import { webinterface } from "../../server/index.ts";

export async function RPCTest() {
  try{
  const exampleSocket = new WebSocket("ws://localhost:8400/", "dcms");
  const exampleChannel = await webSocket2Channel(exampleSocket);
  const client = new Client<webinterface>();
  client.connect(exampleChannel);
  let result = await client.call('readArticle', new Uint8Array([1]));
  // console.log(exampleSocket.readyState)
  console.log(result);
  result = await client.call('readArticle', new Uint8Array([255]));
  console.log(result);
  }catch(e){
    console.log(e)
  }
}
