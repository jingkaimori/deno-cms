import { nodeType, treeNode } from "../../utils/treenode.ts";

type result = [boolean, string];

export type parserContextLabel = {type:string, strremain:string,func:parserfunc<contextValue>,context:contextValue};
export type parserEvent = {type:string,context:parserContextLabel[],desc:string}
export type contextValue =  | { [key in string]: contextValue | string  | number  | boolean  | undefined }  ;
export type emptyContext = {[key in never]:never}
/**
 * @param context This param will be merged to main tree after parsing
 */
export type parserfunc<T extends contextValue = emptyContext> = 
    (
        this:void, str: string, 
        subtree: treeNode<nodeType.detached>, context:T, 
        stack: parserContextLabel[], events:parserEvent[]
    ) => result;
export type parser = 
    (str:string)
    =>{
        tree:treeNode<nodeType.root>,
        stack:parserContextLabel[],
        success:boolean, leftstr:string,
        events:parserEvent[]
    }
export type parservar<T,U extends contextValue = emptyContext> = 
    T|((subtree:Readonly<treeNode<nodeType.semantics>>, context:Readonly<U>)=>T)
