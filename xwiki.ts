import {
  eq,
  match,
  multiple,
  or,
  parserfunc,
  seq,
  symbol,
  treeNode,
} from "./macros.ts";

let whitespace: parserfunc = multiple(match(/[\t ]/), 1);

const linebreak: parserfunc = multiple(match(/[\n\r]/), 1);

export const title: parserfunc = symbol(function __title(str, context) {
  return (seq(
    eq("="),
    or(__title, titletext),
    eq("="),
  ))(str, context);
}, "title");

export const titletext: parserfunc = symbol(
  particleinmiddle(
    multiple(match(/[^\n\r=]/), 1),
    eq("="),
  ),
  "titletext",
);

const path: parserfunc = symbol(
  multiple(match(/[^\n\r\]>]/)),
  "__path",
);

const label: parserfunc = symbol(
  multiple(match(/[^\n\r\]>]/)),
  "__label",
);

// let xwikimacro:parserfunc = symbol(
//   ,"macro"
// )

export const hyperlink: parserfunc = symbol(
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

export const plainchar: parserfunc = match(/[^\n\r\[]/);

export const plain: parserfunc = symbol(
  seq(multiple(match(/[\[]/)), multiple(plainchar, 1)),
  "__plain",
);

export const inline: parserfunc = symbol(
  multiple(
    or(
      hyperlink,
      plain,
    ),
    1,
  ),
  "text",
);

export const listitem: parserfunc = symbol(
  seq(multiple(match(/[*1;.:]/), 1), inline),
  "__listitem",
);

const horizonal = multiple(eq("-"), 4);

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

const br = symbol(match(/[\n\r]/), "br");

const paragraph = symbol(
  or(
    particleinmiddle(listitem, match(/[\n\r]/)),
    particleinmiddle(inline, br),
  ),
  "par",
);

const newline: parserfunc = or(title, horizonal, paragraph);

export const doc: parserfunc = particleinmiddle(
  newline,
  linebreak,
);

export function postprocess(tree: treeNode) {
  if (tree.childs.length > 0 && tree.childs[0].name == "__listitem") {
    let [restree] = listmerge(tree.childs, 1);
    tree.childs = [restree];
  } else {
    for (let i of tree.childs) {
      postprocess(i);
    }
  }
}

function listmerge(iptArr: treeNode[], level: number): [treeNode, number] {
  let resTree = new treeNode(""); 
  let skip: number = 0;
  let lastNode = new treeNode("item");
  for (let [i, item] of iptArr.entries()) {
    if (i < skip) {
      continue;
    }
    let match = item.raw.match(/^[*1:;]*([*1:;])(\.(:))?/);
    let lth = match?.at(0)?.length || -1;
    let flag = match?.at(3) || match?.at(1) || "*";
    if (resTree.name == "") {
      switch (flag) {
        case "*":
          resTree.name = "ulist";
          break;
        case "1":
          resTree.name = "olist";
          break;
        case ";":
        case ":":
        case ".":
          resTree.name = "dlist";
          break;
        default:
          resTree.name = "list";
          break;
      }
    }
    if (lth === level) {
      let newNode = new treeNode("item");
      switch (flag) {
        case "*":
        case "1":
          newNode.name = "item";
          break;
        case ";":
          resTree.name = "dt";
          break;
        case ":":
          resTree.name = "dd";
          break;
        default:
          resTree.name = "item";
          break;
      }
      newNode.raw = item.raw;
      newNode.childs = item.childs;
      resTree.appendchild(newNode);
      lastNode = newNode;
    } else if (lth > level) {
      let [subResTree, __skip] = listmerge(iptArr.slice(i), lth);
      skip = i + __skip;
      lastNode.appendchild(subResTree);
    } else if (lth < level) {
      return [resTree, i];
    }
  }
  return [resTree, iptArr.length];
}
