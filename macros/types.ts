import type { treeNode } from "./utility.ts";
import type * as nodeType from "./nodetype.ts";
export type result = [boolean, string];

export type parserContextLabel = {type:string, strremain:string,func:parserfunc,context:contextValue};
export type parserEvent = {type:string,context:parserContextLabel[],desc:string}
export type contextValue =  | { [key: string]: contextValue | string  | number  | boolean  | undefined | contextValue[]   }  ;
export type parserList = {[key: string]:parserfunc}
/**
 * @param context This param will be merged to main tree after parsing
 */
export type parserfunc = (this:void, str: string, subtree: treeNode<nodeType.detached>, context:contextValue, stack: parserContextLabel[], events:parserEvent[]) => result;
export type parser = (str:string)=>{tree:treeNode<nodeType.root>,stack:parserContextLabel[],success:boolean,leftstr:string, events:parserEvent[]}
export type parservar<T> = T|((subtree:Readonly<treeNode<nodeType.semantics>>, context:Readonly<contextValue>)=>T)

export * as nodeType from  "./nodetype.ts";
export type rootTreeNode = treeNode<nodeType.root>
export type semanticsTreeNode = treeNode<nodeType.semantics>