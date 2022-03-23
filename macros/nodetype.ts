import { treeNode } from "./utility.ts";

export interface general {
    type:string;
    parent:treeNode<general>|null;
    // deno-lint-ignore no-explicit-any
    auxilary:Record<string,any>;
}
export interface nonroot extends general {
    parent:treeNode<general>;
}

export interface root extends general{
    type:'root';
    parent:null;
    auxilary:Record<never,never>;
}