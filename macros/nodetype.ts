import { treeNode } from "./utility.ts";

export interface arbitary {
    type:string;
    parent:treeNode<arbitary>|null;
    auxilary:Record<string,any>;
}

export interface semantics extends arbitary {
    type:string;
    parent:treeNode<semantics>|null;
    auxilary:Record<string,string|number|boolean>;
}
export interface root extends semantics{
    type:'root';
    parent:null;
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