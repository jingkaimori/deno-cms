"use strict";

export class Processors<T>{
    /** @type {Map<string,T>} */
    __list: Map<string,T>;
    /** @type {T} */
    __default: T;
    /**
     * 
     * @param {string} key 
     * @returns {T}
     */
    getProcessor(key: string): T{
        if(this.__list.has(key)){
            return this.__list.get(key) as T;
        }else{
            return this.__default
        }
    }
    /**
     * 
     * @param {string} key 
     * @returns {boolean}
     */
    hasProcessor(key: string): boolean{
        return this.__list.has(key)
    }
    /**
     * 
     * @param {{[k:string]:T}} register 
     * @param {T} defaultP 
     */
    constructor(register: { [k: string]: T; },defaultP: T){
        
        this.__list = new Map(Object.entries(register));
        this.__default = defaultP
    }
}