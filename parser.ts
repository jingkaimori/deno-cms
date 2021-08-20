type result = [boolean, string];
type parserfunc = (str: string, context: treeNode) => result;
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
    console.log(this.name, "pushes", child.name);
    this.childs.push(child);
    return child;
  }
  removechild(child: treeNode): void {
    console.log(this.name, "pops", child.name);
    let candidate = this.childs.pop();
    if (candidate === child) {
    } else {
      console.log("removing middle");
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
let t = {
  "name": "root",
  "raw": "",
  "childs": [{
    "name": "line",
    "raw": "=== title ==",
    "childs": [{ "name": "title", "raw": " title ", "childs": [] }, {
      "name": "plain",
      "raw": "=== title ==",
      "childs": [],
    }],
  }],
};
let plainchar: parserfunc = match(/[^\n\r]/);
let plain: parserfunc = symbol(
  multiple(plainchar),
  "plain",
);

let whitespace: parserfunc = multiple(match(/\s/), 1);

let linebreak: parserfunc = multiple(match(/[\n\r]/), 1);

export let title: parserfunc = symbol(function __title(str, context) {
  return (seq(
    eq("="),
    or(__title, titletext),
    eq("="),
  ))(str, context);
}, "title");

export let titletext: parserfunc = symbol(
  seq(
    multiple(match(/[^\n\r=]/), 1),
    multiple(seq(
      eq("="),
      multiple(match(/[^\n\r=]/), 1),
    )),
  ),
  "titletext",
);

export let newline: parserfunc = symbol(
  or(title, plain),
  "line",
);

export let doc: parserfunc = seq(
  newline,
  multiple(
    seq(linebreak, newline),
  ),
);

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
