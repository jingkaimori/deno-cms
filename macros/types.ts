export type result = [boolean, string];
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
  toString(): string {
    return JSON.stringify(this);
  }
}

export function value<T>( variable :parservar<T>,context: treeNode):T{
    if(variable instanceof Function){
      return variable(context);
    }else{
      return variable;
    }
  }