import { treeNode } from "./utility.ts";

export interface general {
    type:string;
    parent:treeNode<general>|null;
    auxilary:Record<string,string|number|boolean>;
}
export interface root extends general{
    type:'root';
    parent:null;
    auxilary:Record<never,never>;
}