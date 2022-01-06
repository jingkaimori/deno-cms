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
        let tree = new treeNode("root");
        let stack: parsercontextlabel[] = [];
        let [success, leftstr] = parserfunc(str, tree, stack);
        return {
            tree,
            stack,
            success,
            leftstr,
        };
    };
}

export class treeNode {
    name: string;
    raw: string;
    childs: treeNode[];
    parent: treeNode | null;
    constructor(name: string) {
        this.name = name;
        this.childs = [];
        this.raw = "";
        this.parent = null;
    }
    appendchild(child: treeNode): treeNode {
        this.childs.push(child);
        child.parent = this;
        return child;
    }
    removechild(child: treeNode): void {
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
    clone(): treeNode {
        const retval = new treeNode(this.name);
        retval.raw = this.raw;
        retval.parent = this.parent;
        retval.childs = Array.from(this.childs);
        return retval;
    }
}

export function value<T>(variable: parservar<T>, context: treeNode): T {
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
