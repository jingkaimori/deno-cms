import {shuffle} from "./deps.ts"

const valuearray:number[] = []
for (let index = 0; index < 1_000_000; index++) {
    valuearray.push(index)
}
const keyarray = shuffle(valuearray)

const stringkeyarray = keyarray.map((v)=> v.toString())
const arraybufferkeyarray = keyarray.map((v)=> {
    const res =new Uint32Array(1)
    res.fill(v)
    return res
})

const stringmap = new Map<string,number>()
const numbermap = new Map<number,number>()
const buffermap = new Map<Uint32Array,number>()

for (let index = 0; index < 1_000_000; index++) {
    stringmap.set(stringkeyarray[index], valuearray[index])
    numbermap.set(keyarray[index], valuearray[index])
    buffermap.set(arraybufferkeyarray[index], valuearray[index])
}

const tkey =new Uint32Array(1)
tkey.fill(999_999)

const trivnum = Math.random()

Deno.bench({
    name:"number key",
    group:"get",
    fn(){
        numbermap.get(999_999)
    }
})
Deno.bench({
    name:"string key",
    group:"get",
    fn(){
        stringmap.get("999999")
    }
})
Deno.bench({
    name:"arraybuffer key",
    group:"get",
    fn(){
        buffermap.get(tkey)
    }
})

Deno.bench({
    name:"number key",
    group:"set",
    fn(){
        numbermap.set(999_999, trivnum)
    }
})
Deno.bench({
    name:"string key",
    group:"set",
    fn(){
        stringmap.set("999999", trivnum)
    }
})
Deno.bench({
    name:"arraybuffer key",
    group:"set",
    fn(){
        buffermap.set(tkey, trivnum)
    }
})

Deno.bench({
    name:"number key",
    group:"delete",
    fn(){
        numbermap.delete(999_999)
    }
})
Deno.bench({
    name:"string key",
    group:"delete",
    fn(){
        stringmap.delete("999999")
    }
})
Deno.bench({
    name:"arraybuffer key",
    group:"delete",
    fn(){
        buffermap.delete(tkey)
    }
})

