import {
    parserContextLabel,
    parserEvent,
    parserfunc,
    parservar,
    contextValue,
    emptyContext,
} from "./types.ts";
import { cloneContext, errormessage, value } from "./utility.ts";
import { consumedstr } from "./internalutility.ts";
import { treeNode, nodeType } from "../../utils/treenode.ts";
/**
 * this variable turn on such checks
 * - left recurse
 */
const safemode = true;

/**
 * manually guard that left
 * @todo some CSG will left recursive finite times
 * @param func
 * @param type display label for this guard def
 */
export function guard<T extends contextValue = emptyContext>(
    func: parserfunc<T>,
    type: string,
): parserfunc<T> {
    const guardfunc: parserfunc<T> = (str, subtree, context, stack, event) => {
        if (safemode) {
            const labelres = stack.find((v) => v.func == guardfunc);
            if (labelres !== undefined) {
                if (str == labelres.strremain) {
                    throw new Error(errormessage.leftrecurse);
                }
            }
            stack.push({
                type: type,
                func: guardfunc as parserfunc<contextValue>,
                strremain: str,
                context,
            });
            const res = func(str, subtree, context, stack, event);
            stack.pop();
            return res;
        } else {
            return func(str, subtree, context, stack, event);
        }
    };
    return guardfunc;
}


/** Define a meanful symbol in syntax, which creates a subnode 
 * @param func 
 * @param name 
 * @returns 
 */
export function symbol<T extends contextValue = emptyContext>(
    func: parserfunc<T>, name: parservar<string, T>, 
    auxupdator:(context:Readonly<T>)=>nodeType.detached["auxilary"] = ()=>({})
): parserfunc<T> {
    const __symbol: parserfunc<T> = (str, subtree, context, stack, event) => {
        const namevalue = value(name, subtree, context);
        const childsymbol = new treeNode<nodeType.detached>(namevalue);
        const [receive, laststr] = func(str, childsymbol, context, stack, event);
        if (receive) {
            subtree.appendchild(childsymbol);
            childsymbol.auxilary = auxupdator(context)
            childsymbol.raw = consumedstr(str, laststr);
        }
        return [receive, laststr];
    };
    return guard<T>(__symbol, "symbol");
}

/**Determine if given pattern appears repeatly. If min and max be set, then 
 * times in which pattern appears must less than max and greater then main. 
 * 
 * @param func 
 * @param min minium times. if pattern appears in this time, then will pass 
 * the parser
 * @param max minium times. if pattern appears in this time, then will not 
 * pass the parser
 * @param actual 
 * @returns 
 */
export function multiple<T extends contextValue = emptyContext>(
    func: parserfunc<T>,
    min?: parservar<number,T>,
    max?: parservar<number,T>,
    actual?: (context:T,times:number)=>void
): parserfunc<T> {
    return guard<T>((originstr, subtree, context, stack, event) => {
        let times = -1;
        let receive = true, loopstr = originstr;
        do {
            times++;
            const laststr = loopstr;
            [receive, loopstr] = func(loopstr, subtree, context, stack, event);
            if (laststr == loopstr && receive && safemode) {
                throw new Error(errormessage.leftrecurse);
            }
        } while (receive);
        if (min && times < value(min, subtree, context)) {
            return [false, originstr];
        } else if (max && times >= value(max, subtree, context)) {
            return [false, originstr];
        } else {
            if(actual !== undefined){
                actual(context,times)
            } 
            return [true, loopstr];
        }
    }, "multiple");
}

export function not<T extends contextValue = emptyContext>(func: parserfunc<T>): parserfunc<T> {
    return guard((str, subtree, context, stack, event) => {
        const [receive] = func(str, subtree.clone(), context, stack, event);
        if (receive) {
            return [false, str];
        } else {
            return [true, str.slice(1)];
        }
    }, "not");
}

export function scope< newType extends contextValue,oldType extends contextValue = emptyContext>(
    func:parserfunc<newType>,
    initializer: (
        context:oldType
    ) => newType
):parserfunc<oldType>{
    return (str: string, subtree, context, stack, event) => {
        const oldcopy = cloneContext(context);
        const newcontext = initializer(oldcopy)
        return func(str, subtree, newcontext, stack, event)
    };
}

/**
 * @param func
 * @param modifier
 * @returns
 */
export function modifycontext<T extends contextValue = emptyContext>(
    func: parserfunc<T>,
    modifier: (
        context: T,
        consumedstr: string,
        laststr: string,
    ) => void,
): parserfunc<T> {
    return (str: string, subtree, context, stack, event) => {
        const [receive, laststr] = func(str, subtree, context, stack, event);
        if (receive) {
            modifier(context, consumedstr(str, laststr), laststr);
        }
        return [receive, laststr];
    };
}

export function or<T extends contextValue = emptyContext>(...functions: parserfunc<T>[]): parserfunc<T> {
    return guard((str, subtree, context, stack, event) => {
        warnSubparserNums(event, stack, "or", ...functions);
        for (const func of functions) {
            const [receive, next] = func(str, subtree, context, stack, event);
            if (receive) {
                return [true, next];
            }
        }
        return [false, str];
    }, "or");
}

export function seq<T extends contextValue = emptyContext>(...functions: parserfunc<T>[]): parserfunc<T> {
    return guard((str, subtree, context, stack, event) => {
        warnSubparserNums(event, stack, "seq", ...functions);
        let receive = true, newstr = str;
        for (const func of functions) {
            [receive, newstr] = func(newstr, subtree, context, stack, event);
            if (receive) {
                //continue loop
            } else {
                return [false, str];
            }
        }
        return [true, newstr];
    }, "seq");
}

/**get predefiend parserfunc, and avoid "use before declare" assert
 * @param delayedfunc
 * @returns 
 */
export function getparserfunc<T extends contextValue = emptyContext>( delayedfunc:()=> parserfunc<T> ): parserfunc<T> {
    return (str,subtree,context, stack, event)=>{
        
        const labelres = delayedfunc()
        if (labelres === undefined) {
            throw new Error(errormessage.undefinedfunc);
        } else {
            return labelres(str,subtree,context, stack, event)
        }
    }
}

function warnSubparserNums<T extends contextValue>(
    events: parserEvent[],
    stack: parserContextLabel[],
    label: string,
    ...functions: parserfunc<T>[]
): void {
    if (functions.length < 2) {
        const event: parserEvent = {
            type: "Sub-parser num mismatch",
            context: Array.from(stack),
            desc: label +
                "has less than two sub-parsers. maybe this is an error.",
        };
        events.push(event);
    }
}
