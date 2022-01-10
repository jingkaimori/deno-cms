import { parser, parsercontextlabel, parserfunc, parservar } from "./types.ts";

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
        let tree:treeNode<rootNode> = new treeNode<rootNode>("root")
        let stack: parsercontextlabel[] = [];
        const [success, leftstr] = parserfunc(str, tree, stack);
        return {
            tree,
            stack,
            success,
            leftstr,
        };
    };
}
export interface generalNode {
    type:string;
    parent:treeNode<generalNode>|null;
    // deno-lint-ignore no-explicit-any
    auxilary:Record<string,any>;
}
export interface nonrootNode extends generalNode {
    parent:treeNode<generalNode>;
}

export interface rootNode extends generalNode{
    type:'root';
    parent:null;
    auxilary:Record<never,never>;
}
export type treeRootNode = treeNode<rootNode>

export class treeNode<T extends generalNode = nonrootNode> {
    name: T["type"];
    raw: string;
    childs: treeNode[];
    parent: T["parent"];
    auxilary:T["auxilary"];
    constructor(name: T["type"]) {
        this.name = name;
        this.childs = [];
        this.raw = "";
        this.parent = null;
        this.auxilary = {};
    }
    appendchild(child: treeNode<nonrootNode>): treeNode {
        this.childs.push(child);
        child.parent = this;
        return child;
    }
    removechild(child: treeNode<nonrootNode>): void {
        const candidate = this.childs.pop();
        if (candidate === child) {
            //successfully removed
        } else {
            if (candidate) {
                this.childs.push(candidate);
            }
            if (this.childs.find((cur) => cur === child) === undefined) {
                throw new ReferenceError("Delete node is not in tree");
            }
            this.childs = this.childs.filter((cur) => cur !== child);
        }
    }
    toString(space?: string | number): string {
        return JSON.stringify(this, ["name", "raw", "childs"], space);
    }
    clone(): treeNode<T> {
        const retval = new treeNode<T>(this.name);
        retval.raw = this.raw;
        retval.parent = this.parent;
        retval.childs = Array.from(this.childs);
        retval.auxilary = this.auxilary
        return retval;
    }
}

export function value<T>(variable: parservar<T>, context: treeNode<generalNode>): T {
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
