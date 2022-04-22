import { parserfunc } from "./types.ts";

export type CharClass = ReadonlySet<string>

export const getClass = (str:string):CharClass =>{
    return new Set(str)
}

export const unionClass = (...charc:(string|CharClass)[]):CharClass =>{
    const res = new Set<string>()
    for (const i of charc) {
        for(const char of i){
            res.add(char)
        }
    }
    return res;
}

export const charClasses = {
    latinAlphabetLowercase:getClass("abcdefghijklmnopqrstuvwxyz"),
    latinAlphabetUppercase:getClass("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
    latinAlphabet:getClass("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
    numeral:getClass("0123456789"),
}

export const inClass = (charClass:CharClass):parserfunc => {
    return (str)=>{
        const head = str.charAt(0)
        if(charClass.has(head)){
            return [
                true,str.slice(1)
            ]
        }else{
            return [
                false,str
            ]
        }
    }
}
