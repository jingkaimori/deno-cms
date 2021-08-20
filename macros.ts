type result = [boolean, string];
export type parserfunc = (str: string, context: treeNode) => result;
export class treeNode {
  name: string;
  raw: string;
  childs: treeNode[];
  constructor(name: string) {
    this.name = name;
    this.childs = [];
    this.raw = "";
  }
  appendchild(child: treeNode): treeNode {
    this.childs.push(child);
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

export function symbol(func: parserfunc, name: string): parserfunc {
  return (str, context) => {
    let childsymbol = new treeNode(name);
    context.appendchild(childsymbol);
    let [receive, laststr] = func(str, childsymbol);
    if (!receive) {
      context.removechild(childsymbol);
    } else {
      if (laststr.length > 0) {
        childsymbol.raw = str.slice(0, str.indexOf(laststr));
      } else {
        childsymbol.raw = str;
      }
    }
    return [receive, laststr];
  };
}

export function multiple(
  func: parserfunc,
  min?: number,
  max?: number,
): parserfunc {
  return (str, context) => {
    let times = -1;
    let receive = true, newstr = str;
    do {
      times++;
      [receive, newstr] = func(newstr, context);
    } while (receive);
    if (min && times < min) {
      return [false, newstr];
    } else if (max && times >= max) {
      return [false, newstr];
    } else {
      return [true, newstr];
    }
  };
}

export function or(...functions: parserfunc[]): parserfunc {
  return (str, context) => {
    for (let func of functions) {
      let [receive, next] = func(str, context);
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
    for (let func of functions) {
      [receive, newstr] = func(newstr, context);
      if (receive) {
      } else {
        return [false, str];
      }
    }
    return [true, newstr];
  };
}

export function eq(expected: string): parserfunc {
  return (str, context) => {
    if (str.length > 0 && str.indexOf(expected) == 0) {
      return [true, str.slice(expected.length)];
    } else {
      return [false, str];
    }
  };
}

export function match(pattern: RegExp): parserfunc {
  return (str, context) => {
    let res = str.match(pattern);
    if (str.length > 0 && res?.index === 0) {
      return [true, str.slice(res[0].length)];
    } else {
      return [false, str];
    }
  };
}
