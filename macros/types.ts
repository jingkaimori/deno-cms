import type { treeNode } from "./utility.ts";
import type * as nodeType from "./nodetype.ts";
export type result = [boolean, string];

export type parsercontextlabel = {label:string,type:string, strremain:string,func:parserfunc};
export type parserevent = {type:string,context:parsercontextlabel[],desc:string}
export type parserfunc = (str: string, context: treeNode<nodeType.general>, stack: parsercontextlabel[], events:parserevent[]) => result;
export type parser = (str:string)=>{tree:treeNode<nodeType.root>,stack:parsercontextlabel[],success:boolean,leftstr:string, events:parserevent[]}
export type parservar<T> = T|((context:Readonly<treeNode<nodeType.general>>)=>T)

export * as nodeType from  "./nodetype.ts";
export type rootTreeNode = treeNode<nodeType.root>
export type generalTreeNode = treeNode<nodeType.general>