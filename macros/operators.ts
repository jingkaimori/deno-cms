import { parserfunc, parservar, treeNode, value } from "./types.ts"
import { consumedstr } from "./utility.ts";

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
  return (str, context) => {
    let times = -1;
    let receive = true, newstr = str;
    do {
      times++;
      [receive, newstr] = func(newstr, context);
    } while (receive);
    if (min && times < value(min,context)) {
      return [false, str];
    } else if (max && times >= value(max,context)) {
      return [false, str];
    } else {
      return [true, newstr];
    }
  };
}

export function not(func: parserfunc): parserfunc {
  return (str, context) => {
    const [receive,] = func(str, context);
    if (receive) {
      return [false, str];
    } else {
      return [true, str.slice(1)];
    }
  };
}

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

