import { parsercontextlabel, parserevent, parserfunc, parservar } from "./types.ts"
import { treeNode, generalNode, value, errormessage } from "./utility.ts";
import { consumedstr } from "./internalutility.ts";
/**
 * this variable turn on such checks
 * - left recurse
 */
const safemode = true;

/**
 * manually guard that left 
 * some CSG will left recursive finite times
 * @param func 
 * @param type display label for this guard def
 * @param label lookup label for this func
 */
export function guard(func: parserfunc, type: string, label?:parservar<string>):parserfunc {
  const guardfunc:parserfunc = (str, context, stack, event) => {
    if(safemode){
        const labelres = stack.find((v)=>v.func==guardfunc);
        if(labelres !== undefined){
          if(str == labelres.strremain){
            throw new Error(errormessage.leftrecurse)
          }
        }
        stack.push({
          type:type,
          label:label===undefined?"":value(label,context),
          func:guardfunc,
          strremain:str,
        });
        const res = func(str, context, stack, event);
        stack.pop();
        return res;
    }else{
      return func(str, context, stack, event);
    }
  }
  return guardfunc;
}

export function symbol(func: parserfunc, name: parservar<string>): parserfunc {
  const __symbol:parserfunc = (str, context, stack, event) => {
    const namevalue=value(name,context);
    const childsymbol = new treeNode(namevalue);
    context.appendchild(childsymbol);
    const [receive, laststr] = func(str, childsymbol, stack, event);
    if (!receive) {
      context.removechild(childsymbol);
    } else {
      childsymbol.raw = consumedstr(str,laststr);
    }
    return [receive, laststr];
  }
  return guard(__symbol,"symbol",name);
}

export function multiple(
  func: parserfunc,
  min?: parservar<number>,
  max?: parservar<number>,
): parserfunc {
  return guard((originstr, context, stack, event) => {
    let times = -1;
    let receive = true, loopstr = originstr;
    do {
      times++;
      const laststr = loopstr;
      [receive, loopstr] = func(loopstr, context, stack, event);
      if(laststr == loopstr&&receive&&safemode){
        throw new Error(errormessage.leftrecurse)
      }
    } while (receive);
    if (min && times < value(min,context)) {
      return [false, originstr];
    } else if (max && times >= value(max,context)) {
      return [false, originstr];
    } else {
      return [true, loopstr];
    }
  },"multiple");
}

export function not(func: parserfunc): parserfunc {
  return guard((str, context, stack, event) => {
    const [receive,] = func(str, context.clone(), stack, event);
    if (receive) {
      return [false, str];
    } else {
      return [true, str.slice(1)];
    }
  },"not");
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
export function modifycontext(func:parserfunc,modifier:(str:string,laststr:string,context:treeNode<generalNode>)=>void):parserfunc{
  return (str:string,context,stack, event)=>{
    const [receive, laststr] = func(str, context,stack, event);
    if (receive)  {
      modifier(str,laststr,context);
    }
    return [receive,laststr]
  }
}

export function or(...functions: parserfunc[]): parserfunc {
  return guard((str, context, stack, event) => {
    warnSubparserNums(event,stack,"or",...functions)
    for (const func of functions) {
      const [receive, next] = func(str, context, stack, event);
      if (receive) {
        return [true, next];
      }
    }
    return [false, str];
  },"or");
}

export function seq(...functions: parserfunc[]): parserfunc {
  return guard((str, context, stack, event) => {
    warnSubparserNums(event,stack,"seq",...functions)
    let receive = true, newstr = str;
    for (const func of functions) {
      [receive, newstr] = func(newstr, context, stack, event);
      if (receive) {
        //continue loop
      } else {
        return [false, str];
      }
    }
    return [true, newstr];
  },"seq");
}

export function getparserfunc(name:string):parserfunc {
  return (str,ctx,stack, event)=>{
    const labelres = stack.find((v)=>v.label==name);
    if(labelres === undefined){
      throw new Error(errormessage.undefinedfunc)
    }else{
      const func = labelres.func;
      return func(str,ctx,stack, event);
    }
  }
}

function warnSubparserNums(events:parserevent[],stack:parsercontextlabel[],label:string,...functions: parserfunc[]): void {
  if(functions.length<2){
    const event:parserevent = {
      type:"Sub-parser num mismatch",
      context: Array.from(stack),
      desc:label + "has less than two sub-parsers. maybe this is an error."
    }
    events.push(event)
  }
}