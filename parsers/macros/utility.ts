import { treeNode,nodeType, rootTreeNode } from "../../utils/treenode.ts";
import type { parser, parserContextLabel, parserEvent, parserfunc, parservar, contextValue } from "./types.ts";

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
        const stack: parserContextLabel[] = [];
        const events: parserEvent[] = [];
        const [success, leftstr] = parserfunc(str, tree, {}, stack,events);
        return {
            tree,
            stack,
            success,
            leftstr,
            events,
        };
    };
}

export function value<T, U extends contextValue =contextValue>(
    variable: parservar<T,U>, subtree: treeNode<nodeType.semantics>, context:U
): T {
    if (variable instanceof Function) {
        return variable(subtree, context);
    } else {
        return variable;
    }
}

export function cloneContext<T extends contextValue>(contest: T):T{
    const res:T = Object.assign({},contest)
    for (const key in res) {
        if (
            Object.prototype.hasOwnProperty.call(res, key) &&
            typeof res[key] == "object"
        ) {
            // deno-lint-ignore no-explicit-any
            res[key] = cloneContext(res[key] as any)
        }
    }
    return res
}

export class ParserError extends Error {
    constructor(msg: string, stack: parserContextLabel[]) {
        console.error(stack);
        super(msg);
    }
}
