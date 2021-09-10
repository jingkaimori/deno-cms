
import { treeNode } from "../../macros.ts";
import { Processors } from "./processer.ts";
type contextType = Record<string, any>;

type processer = (
    iptTree: treeNode,
    resTree: HTMLElement,
    context: contextType,
  ) => [HTMLElement];
  let mappers = new Processors<processer>({
    "title": function name(tree, output, context) {
      let match = tree.raw.match(/^=+/);
      let lth = match?.at(0)?.length;
      if (lth) {
        let title = document.createElement("h" + lth.toString());
        output.append(title);
        return [title];
      } else {
        let title = document.createElement("p");
        output.append(title);
        return [title];
      }
    },
    "root": mapToNode("article"),
    "par": mapToNode("p"),
    "hyperlink": mapToNode("a"),
    "ulist": mapToNode("ul"),
    "olist": mapToNode("ol"),
    "dlist": mapToNode("dl"),
    "item": mapToNode("li"),
    "dt": mapToNode("dt"),
    "dd": mapToNode("dd"),
    "br": mapToNode("br"),
    "__label": mapToText(),
    "__path": function (tree, output, context) {
        if(/^url:(.*)/.test(tree.raw)){
          (output as HTMLAnchorElement).setAttribute("href",(/^url:(.*)/.exec(tree.raw) as RegExpExecArray)[1]);
        }else{
          (output as HTMLAnchorElement).setAttribute("href",getArticleTitle(tree.raw));
        }
        return [output];
    },
    "__plain": mapToText(),
    "titletext": mapToText(),
  }, (i, r, c) => [r]);
  
  export function mapNode(
    iptTree: treeNode,
    resTree: HTMLElement,
    contextStack: contextType[],
  ): [HTMLElement, contextType] {
    //console.group(iptTree.parentNode?.nodeName)
    //console.info(`${iptTree.parentNode?.nodeName}->${iptTree.nodeName}`,resTree.nodeName)
    let passSelected = mappers.getProcessor(iptTree.name);
    let context = contextStack.reduce(
      (pre, cur) => {
        return Object.assign(pre, cur);
      },
      {},
    );
    let newScope = undefined;
    [resTree] = passSelected(iptTree, resTree, context);
    if (newScope !== undefined) {
      contextStack.push(newScope);
    } /* do nothing */
    else {
      for (let i of iptTree.childs) {
        mapNode(i, resTree, contextStack);
      }
    }
    //console.groupEnd()
    return [resTree, context];
  }

  function mapToNode(name:string):processer{
    return function(tree, output, context) {
        let title = document.createElement(name);
        output.append(title);
        return [title];
    }
  }
  function mapToText():processer{
    return (tree, output, context) =>{
    let rawtext = tree.raw;
    let text = document.createTextNode(rawtext);
    output.append(text);
    return [output];
  }}
  export   function getArticleTitle(filename:string) {
      return ("./export/"+filename.replace(/\./g, "/")+".xml")
  }

