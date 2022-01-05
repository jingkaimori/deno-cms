import type { treeNode } from "./utility.ts";
export type result = [boolean, string];
export type parsercontextlabel = {label:string,func:parserfunc};
export type parserfunc = (str: string, context: treeNode, stack: parsercontextlabel[]) => result;
export type parser = (str:string)=>{tree:treeNode,stack:parsercontextlabel[],success:boolean,leftstr:string}
export type parservar<T> = T|((context:Readonly<treeNode>)=>T)
