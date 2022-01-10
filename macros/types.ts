import type { treeNode, rootNode, generalNode } from "./utility.ts";
export type result = [boolean, string];
export type parsercontextlabel = {label:string,type:string, strremain:string,func:parserfunc};
export type parserfunc = (str: string, context: treeNode<generalNode>, stack: parsercontextlabel[]) => result;
export type parser = (str:string)=>{tree:treeNode<rootNode>,stack:parsercontextlabel[],success:boolean,leftstr:string}
export type parservar<T> = T|((context:Readonly<treeNode<generalNode>>)=>T)
