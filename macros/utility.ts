import { plainDocument } from "../types/data.ts";
import type { parser, parsercontextlabel, parserevent, parserfunc, parservar, nodeType, rootTreeNode } from "./types.ts";

/**
 * 
 */
export const errormessage = {
    leftrecurse : "multiple match found too many empty match, are there some bug?",
    eqemptystr : "nothing equals an empty string\"\", consider using empty() instead",
    undefinedfunc : "function referred is undefined, functions must be declared using symbol()"
}

export function getparser(parserfunc: parserfunc): parser {
    return (str: string) => {
        const tree: rootTreeNode = new treeNode<nodeType.root>("root")
        const stack: parsercontextlabel[] = [];
        const events: parserevent[] = [];
        const [success, leftstr] = parserfunc(str, tree, stack,events);
        return {
            tree,
            stack,
            success,
            leftstr,
            events,
        };
    };
}

export class treeNode<T extends nodeType.general = nodeType.nonroot> {
    name: T["type"];
    raw: string;
    #childs: treeNode[];
    parent: T["parent"];
    auxilary:T["auxilary"];
    // #namedchilds:Map<string,treeNode>
    constructor(name: T["type"]) {
        this.name = name;
        this.#childs = [];
        // this.#namedchilds = new Map();
        this.raw = "";
        this.parent = null;
        this.auxilary = {};
    }
    get childs(): readonly treeNode[]{
        return this.#childs
    }
    /** @todo use k-v map to accelerate this lookup */
    childByName(name:string){
        return this.#childs.find((v) => (v.name == name))
    }
    appendchilds(childsnew: Readonly<treeNode[]>): void {
        for(const childnew of childsnew){
            childnew.parent = this
        }
        this.#childs = this.#childs.concat(childsnew);
    }
    appendchild(child: treeNode): treeNode {
        this.#childs.push(child);
        child.parent = this;
        return child;
    }
    clearChilds():void{
        this.#childs = []
    }
    removechild(child: treeNode): void {
        const candidate = this.#childs.pop();
        if (candidate === child) {
            //successfully removed
        } else {
            if (candidate) {
                this.#childs.push(candidate);
            }
            if (this.#childs.find((cur) => cur === child) === undefined) {
                throw new ReferenceError("Delete node is not in tree");
            }
            this.#childs = this.#childs.filter((cur) => cur !== child);
        }
    }
    toString(space?: string | number): string {
        return JSON.stringify(this.toPlainObject() ,undefined , space);
    }
    toPlainObject():plainDocument{
        const childsres:plainDocument[] = 
            this.#childs.map((val)=>val.toPlainObject())
        return {
            name:this.name,
            raw:this.raw,
            auxilary:this.auxilary,
            childs:childsres
        }
    }
    static fromPlainObject(obj:plainDocument):treeNode{
        const childsres:treeNode[] = 
            obj.childs.map((val)=>this.fromPlainObject(val))
        const res:treeNode = new treeNode(obj.name)
        res.auxilary = obj.auxilary
        res.raw = obj.raw
        res.appendchilds(childsres)
        return res;
    }
    clone(): treeNode<T> {
        const retval = new treeNode<T>(this.name);
        retval.raw = this.raw;
        retval.parent = this.parent;
        retval.#childs = Array.from(this.#childs);
        retval.auxilary = this.auxilary
        return retval;
    }
}

export function value<T>(variable: parservar<T>, context: treeNode<nodeType.general>): T {
    if (variable instanceof Function) {
        return variable(context);
    } else {
        return variable;
    }
}

export class ParserError extends Error {
    constructor(msg: string, stack: parsercontextlabel[]) {
        console.error(stack);
        super(msg);
    }
}
