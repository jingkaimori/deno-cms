import { eq, match, multiple, or, parserfunc, seq, symbol, treeNode,getparserfunc } from "../macros/macros.ts";

let plainchar: parserfunc = match(/[^\n\r]/);
let plain: parserfunc = symbol(
  multiple(plainchar),
  "__plain",
);

let whitespace: parserfunc = multiple(match(/[\t ]/), 1);

let linebreak: parserfunc = multiple(match(/[\n\r]/), 1)

export let titletext: parserfunc = symbol(
  particleinmiddle(
    multiple(match(/[^\n\r=]/), 1),
    eq("="),
  ),
  "titletext",
);

export const title: parserfunc = symbol(seq(
    eq("="),
    or(getparserfunc("title"), titletext),
    eq("="),
  ), "title");

let path: parserfunc = symbol(
  multiple(match(/[^\n\r\]>]/)),
  "__path",
);

let label: parserfunc = symbol(
  multiple(match(/[^\n\r\]>]/)),
  "__label",
);

export let hyperlink: parserfunc = symbol(
  seq(
    eq("[["),
    label,
    multiple(
      seq(
        eq(">>"),
        path,
      ),
      0,
      2,
    ),
    eq("]]"),
  ),
  "hyperlink",
);

export let linkfreechar: parserfunc = match(/[^\n\r\[]/);

export let inline: parserfunc = symbol(
  multiple(
    or(
      hyperlink,
      symbol(seq(multiple(eq("[")), multiple(linkfreechar, 1)), "__plain"),
    ),1
  ),
  "text",
);

export let listitem: parserfunc = symbol(
  seq(multiple(match(/[*#;:]/), 1), inline),
  "__listitem",
);

let titleline = seq(title, linebreak);

/**
 * match mode like `A(BA)*`
 * @param beginend
 * @param middle
 * @returns
 */
function particleinmiddle(
  beginend: parserfunc,
  middle: parserfunc,
): parserfunc {
  return seq(beginend, multiple(seq(middle, beginend)));
}

let paragraph = symbol(
  or(
    particleinmiddle(listitem, match(/[\n\r]/)),
    particleinmiddle(inline, match(/[\n\r]/)),
  ),
  "paragraph",
);

let newline: parserfunc = or(title, paragraph);

export let doc: parserfunc = particleinmiddle(
  newline,
  linebreak,
);

export function postprocess(tree:treeNode) {
  if(tree.childs.length>0 && tree.childs[0].name == "__listitem"){
      let [restree] = listmerge(tree.childs,1);
      tree.childs = [restree];
  }else{
      for(let i of tree.childs){
      postprocess(i)

      }
  }
}

function listmerge(iptArr: treeNode[],level:number):[treeNode,number] {
let resTree = new treeNode("list");
let skip:number=0;
for(let [i,item] of iptArr.entries()){
    if(i<skip){
        continue;
    }
    let match = item.raw.match(/^[*#:;]+/)
    let lth = match?.at(0)?.length || -1;
    if(lth === level){
        let newNode = new treeNode("item")
        newNode.raw = item.raw
        newNode.childs = item.childs
        resTree.appendchild(newNode)
    }else if(lth > level){
        let newNode = new treeNode("item")
        newNode.raw = item.raw
        let [subResTree,__skip]=listmerge(iptArr.slice(i),lth)
        skip =i+ __skip;
        newNode.childs.push(subResTree)
        resTree.appendchild(newNode)
        
    }else if(lth < level){
        return [resTree,i];
    }
}
return [resTree,iptArr.length];
}