import { treeNode } from "./treenode.ts";

export interface arbitary {
    type:string;
    parent:treeNode<arbitary>|null;
    // deno-lint-ignore no-explicit-any
    auxilary:Record<string,any>;
}

export interface semantics extends arbitary {
    type:string;
    parent:treeNode<semantics>|null;
    auxilary:Record<string,string|number|boolean>;
}

export interface detached extends semantics{
    parent:null;
}
export interface root extends detached{
    type:'root';
    auxilary:Record<never,never>;
}

export interface display extends arbitary {
    type:string;
    parent:treeNode<semantics>|null;
    auxilary:{
        semanticRole: string;
        relatedField: treeNode<semantics>;
        styleParam: Record<string,string|number|boolean>;
    }
}