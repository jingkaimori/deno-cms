import { RemoteContent, RemoteValue } from "../types/repository.ts";
import { status } from "../types/errors.ts";

type serverReturnType = void | RemoteContent<RemoteValue> | status

type serverFunctions = {
    [_ in string]: 
        // deno-lint-ignore no-explicit-any
        (this:void, ...t: any[]) 
            => serverReturnType
}


type Channel  = AsyncIterable<string> & {
    send(message:string): void
}

type Request<T extends serverFunctions = serverFunctions, method extends keyof T= keyof T> = {
    name: method,
    param: Parameters<T[method]>,
    id?: number
}
type Response<Return extends serverReturnType = serverReturnType> = {
    returns: Return
    id: number
}

export class Server<T extends serverFunctions> {
    #handler:T;
    #channel: Channel| null;
    constructor(handler:T) {
        this.#handler = handler
        this.#channel = null
    }

    async listen(channel:Channel) {
        if (this.#channel) {
            this.close()
        }
        this.#channel = channel
        for await (const message of channel) {
            const req = JSON.parse(message) as Request<T>
            
            const func = this.#handler[req.name]
            const res = func(...req.param)
            
            if (req.id !== undefined) {
                const resp:Response = {
                    returns:res,
                    id: req.id
                }

                channel.send(JSON.stringify(resp))
            }
        }
    }

    close(){
        if (this.#channel === null) {
            return
        }
        const res = this.#channel[Symbol.asyncIterator]()
        if(res.return !== undefined){
            res.return()
        }
    }
}

export class Client<T extends serverFunctions> {
    #channel?: Channel
    #cachedResponse : Map<number,serverReturnType>
    #ids: number
    constructor() {
        this.#cachedResponse = new Map()
        this.#ids = 0
    }

    connect(channel:Channel){
        if (this.#channel) {
            this.close()
        }
        this.#channel = channel
    }
    async call<name extends keyof T = keyof T>(
        method: name, ...params:Parameters<T[name]>
    ): Promise<ReturnType<T[name]>>{
        if (this.#channel === undefined) {
            throw new Error("connection is not established, please connect first");
        }
        
        const reqid = this.#ids
        const req:Request<T> ={
            name: method,
            param: params,
            id: reqid
        }
        this.#channel?.send(JSON.stringify(req))

        do {
            if (this.#cachedResponse.has(reqid)) {
                return this.#cachedResponse.get(reqid) as ReturnType<T[name]>
            }
            const iterres = await this.#channel[Symbol.asyncIterator]().next()
            if (iterres.done) {
                throw new Error("response not appear")
            }else{
                const resp = JSON.parse(iterres.value) as Response<ReturnType<T[name]>>
                if (resp.id == reqid) {
                    return resp.returns
                } else {
                    this.#cachedResponse.set(resp.id,resp.returns)
                }
            }
        } while(true)

    }
    close(){
        if (this.#channel === undefined) {
            return
        }
        const res = this.#channel[Symbol.asyncIterator]()
        if(res.return !== undefined){
            res.return()
        }
    }
}

export function webSocket2Channel(socket:WebSocket): Promise<Channel>{
  if (socket.readyState === socket.OPEN) {
    return Promise.resolve(socketWrapper(socket))
  } else if (
    socket.readyState === socket.CONNECTING 
    || (socket instanceof WebSocket && socket.readyState === undefined)) //HACK: websocket create by deno may have this field undefined
  {
    return new Promise((resolve,reject) =>{
      socket.onopen = ()=>{
        resolve(socketWrapper(socket))
        socket.onopen = null
      }
      socket.onerror = (err)=>{
        reject(err)
        socket.onerror = null
      }

    })
  } else if (socket.readyState === socket.CLOSED || socket.readyState === socket.CLOSING) {
    return Promise.reject(new Error("socket inner error"))
  } else {
    return Promise.reject(new Error(
      "socket status error, current socket detail:\n"
      + " socket object: " + socket  + "\n" 
      + " socket state: " + socket.readyState + "\n"
      + " socket url: " + socket.url))
  }

}

function socketWrapper(socket:WebSocket):Channel {
  return {
    send(string) {
      console.log(socket.readyState)
      socket.send(string);
    },
    [Symbol.asyncIterator]() {
      return {
        next(): Promise<IteratorResult<string, undefined>> {
          return new Promise((resolve, reject) => {
            socket.onmessage = async (ev) => {
              let value = '';
              if(typeof ev.data == 'string' || ev.data instanceof String) {
                value = ev.data.valueOf();
              } else if(ev.data instanceof Blob) {
                value = await ev.data.text();
              } else if(ev.data instanceof ArrayBuffer) {
                value = await new Blob([ev.data]).text();
              }
              resolve({
                done: false,
                value
              });
            };
            socket.onerror = (ev) => {
              console.log("socket disrupted")
              reject(ev);
            };
            socket.onclose = (_e) => {
              console.log("socket closed")
              resolve({
                done: true,
                value: undefined
              });
            };
          });
        },
        return(): Promise<IteratorResult<string, undefined>> {
          socket.close();
          return Promise.resolve({
            done: true,
            value: undefined
          });
        },
        throw(): Promise<IteratorResult<string, undefined>> {
          socket.close();
          return Promise.reject({
            done: true,
            value: undefined
          });
        }
      };
    }
  };
}
