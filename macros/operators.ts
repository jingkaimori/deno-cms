import { parserfunc, parservar, treeNode, value } from "./types.ts"
import { consumedstr } from "./utility.ts";
/**
 * this variable turn on such checks
 * - left recurse
 */
const safemode = true;
const msg = {
  leftrecurse : "multiple match found too many empty match, are there some bug?"
}

/**
 * manually guard that left 
 * some CSG will left recursive finite times
 * @param func 
 * @todo change parserfunc def to include func stack.
 */
export function guard(func: parserfunc):parserfunc {
  return (str, context ) => {
    if(safemode){
      throw new Error("function not implemented")
      // let caller = guard.caller;
      // while(caller){
      //   if(caller==func && caller.arguments[0] == func.arguments[0]){
      //     throw new Error(msg.leftrecurse)
      //   }
      //   caller = caller.caller;
      // }

    }
    return func(str,context);
  }
}

export function symbol(func: parserfunc, name: parservar<string>): parserfunc {
  return (str, context) => {
    const namevalue=value(name,context);
    const childsymbol = new treeNode(namevalue);
    context.appendchild(childsymbol);
    const [receive, laststr] = func(str, childsymbol);
    if (!receive) {
      context.removechild(childsymbol);
    } else {
      childsymbol.raw = consumedstr(str,laststr);
    }
    return [receive, laststr];
  };
}

export function multiple(
  func: parserfunc,
  min?: parservar<number>,
  max?: parservar<number>,
): parserfunc {
  return (originstr, context) => {
    let times = -1;
    let receive = true, loopstr = originstr;
    do {
      times++;
      const laststr = loopstr;
      [receive, loopstr] = func(loopstr, context);
      if(laststr == loopstr&&receive&&safemode){
        throw new Error(msg.leftrecurse)
      }
    } while (receive);
    if (min && times < value(min,context)) {
      return [false, originstr];
    } else if (max && times >= value(max,context)) {
      return [false, originstr];
    } else {
      return [true, loopstr];
    }
  };
}

export function not(func: parserfunc): parserfunc {
  return (str, context) => {
    const [receive,] = func(str, context.clone());
    if (receive) {
      return [false, str];
    } else {
      return [true, str.slice(1)];
    }
  };
}

/**
 * this func is deprecated due to inrevertable change to nodes
 * image that this func modify content in grandparent, but parent is rejected, so parent is removed but modification for grandparent is kept.
 * function should only modify its current treeNode, getters is responsible to grab info from slibings
 * @deprecated
 * @param func 
 * @param modifier 
 * @returns 
 */
export function modifycontext(func:parserfunc,modifier:(str:string,laststr:string,context:treeNode)=>void):parserfunc{
  return (str:string,context:treeNode)=>{
    const [receive, laststr] = func(str, context);
    if (receive)  {
      modifier(str,laststr,context);
    }
    return [receive,laststr]
  }
}

export function or(...functions: parserfunc[]): parserfunc {
   __warnSubparserNums(or,...functions)
  return (str, context) => {
    for (const func of functions) {
      const [receive, next] = func(str, context);
      if (receive) {
        return [true, next];
      }
    }
    return [false, str];
  };
}

export function seq(...functions: parserfunc[]): parserfunc {
   __warnSubparserNums(seq,...functions);
  return (str, context) => {
    let receive = true, newstr = str;
    for (const func of functions) {
      [receive, newstr] = func(newstr, context);
      if (receive) {
        //continue loop
      } else {
        return [false, str];
      }
    }
    return [true, newstr];
  };
}


/**
 * not recommend to use out of macro meta defs
 * @param functions 
 */
 function  __warnSubparserNums(context:Function,...functions: parserfunc[]): void {
  if(functions.length<2){
    console.warn(context.name + "has less than two sub-parsers. maybe this is an error.")
  }
}