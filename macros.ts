type result = [boolean, string];
export type parserfunc = (str: string, context: treeNode) => result;
export type parservar<T> = T|((context: treeNode)=>T)
export class treeNode {
  name: string;
  raw: string;
  childs: treeNode[];
  parent: treeNode|null;
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
    let candidate = this.childs.pop();
    if (candidate === child) {
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
  toString(): string {
    return JSON.stringify(this);
  }
}

export function consumedstr(str:string,newstr:string){
  if (newstr.length > 0) {
    return str.slice(0, str.indexOf(newstr));
  } else {
    return str;
  }
}

export function symbol(func: parserfunc, name: parservar<string>): parserfunc {
  return (str, context) => {
    const namevalue=value(name,context);
    let childsymbol = new treeNode(namevalue);
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
      } else {
        return [false, str];
      }
    }
    return [true, newstr];
  };
}

export function value<T>( variable :parservar<T>,context: treeNode):T{
  if(variable instanceof Function){
    return variable(context);
  }else{
    return variable;
  }
}

export function eq(expectedraw: parservar<string>): parserfunc {
  return (str, context) => {
    const expected:string = value(expectedraw,context);
    if (str.length > 0 && str.indexOf(expected) == 0) {
      return [true, str.slice(expected.length)];
    } else {
      return [false, str];
    }
  };
}


export function neq(expectedraw: parservar<string>): parserfunc {
  return (str, context) => {
    const expected:string = value(expectedraw,context);
    if (str.length > 0 && str.indexOf(expected) == 0) {
      return [false, str];
    } else {
      return [true, str.slice(1)];
    }
  };
}

export function match(patternraw: parservar<RegExp>): parserfunc {
  return (str, context) => {
    const pattern = value(patternraw,context)
    const res = str.match(pattern);
    if (str.length > 0 && res?.index === 0) {
      return [true, str.slice(res[0].length)];
    } else {
      return [false, str];
    }
  };
}
