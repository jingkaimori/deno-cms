import {
  empty,
  eq,
  generalNode,
  getparser,
  getparserfunc,
  match,
  multiple,
  neq,
  not,
  or,
  parserfunc,
  seq,
  symbol,
  treeNode,
} from "../macros/macros.ts";

const whitespace: parserfunc = multiple(match(/[\t ]/), 1);

const linebreak: parserfunc = multiple(match(/[\n\r]/), 1);

export const titletext: parserfunc = symbol(
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

const path: parserfunc = symbol(
  multiple(match(/[^\n\r\]>]/)),
  "__path",
);

const label: parserfunc = symbol(
  multiple(match(/[^\n\r\]>]/)),
  "__label",
);

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

const escapetext: parserfunc = symbol(multiple(neq("}}}")), "__plain");
const escape: parserfunc = symbol(
  seq(eq("{{{"), escapetext, eq("}}}")),
  "rawtext",
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

/**
 * @todo extract attribute
 */
const macroattr: parserfunc = seq(
  whitespace,
  multiple(not(or(eq("}}"), eq("/}}"), linebreak, empty))),
);

const macroname: parserfunc = symbol(match(/^[^ \/{}\n]*/), "__name");

const macrobegin: parserfunc = seq(
  eq("{{"),
  macroname,
  multiple(macroattr),
  eq("}}"),
);

const macroend: parserfunc = seq(
  eq("{{/"),
  eq((context) => {
    const namenode = context.childs.find((v) => (v.name == "__name"));
    return namenode?.raw ?? "";
  }),
  eq("}}"),
);

const macrobody: parserfunc = symbol(
  multiple(neq("{{")),
  "__plain",
);

export const macrowithoutbody: parserfunc = symbol(
  seq(
    eq("{{"),
    macroname,
    multiple(macroattr),
    eq("/}}"),
  ),
  "template",
);

const macroblock: parserfunc = symbol(
  seq(macrobegin, macrobody, macroend),
  "template",
);

const macroinlinebody: parserfunc = symbol(
  multiple(not(or(eq("{{"),eq("\n"),empty))),
  "__plain",
);

const macroinline: parserfunc = symbol(
  seq(macrobegin, macroinlinebody, macroend),
  "template",
);

export const plain: parserfunc = symbol(
  multiple(not(or(hyperlink, escape,macrobegin, linebreak, empty)), 1),
  "__plain",
);

export const inline: parserfunc = symbol(
  multiple(
    or(
      hyperlink,
      macroinline,
      macrowithoutbody,
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

export const followedlist: parserfunc = symbol(
  seq(
    match(/[\n\r]/),
    (s, context, stack, e) => {
      const namenode = context?.parent?.childs.at(0)?.childs
        .find((v) => (v.name == "__delim"));
      const depth = namenode?.raw?.match(/(\*\.|\*|1\.|1|;|:)/g)?.length
      let lthval = depth ?? 1;
      let newlth = lthval + 1;
      return symbol(
        multiple(match(/(\*\.|\*|1\.|1|;|:)/), lthval, newlth),
        "__delim",
      )(s, context, stack, e);
    },
    inline,
  ),
  "__listitemnew",
);

export const listitemnew: parserfunc = symbol(
  seq(
    symbol(
      multiple(match(/(\*\.|\*|1\.|1|;|:)/),(context) => {
        const namenode = context?.parent?.parent?.parent?.
          childs.at(0)?.childs.find((v) => (v.name == "__delim"));
        const depth = namenode?.raw?.match(/(\*\.|\*|1\.|1|;|:)/g)?.length
        return (depth ?? 0)+1;
      }),
      "__delim",
    ),
    inline,
  ),
  "__listitemnew",
);

// export const list: parserfunc = function __list(str, context, stack) {
//   const cascadedlist = multiple(seq(match(/[\n\r]/), __list), 0, 2);
//   return symbol(
//     seq(
//       listitemnew,
//       cascadedlist,
//       multiple(seq(followedlist, cascadedlist)),
//     ),
//     "__list",
//   )(str, context, stack);
// };
const cascadedlist = multiple(seq(match(/[\n\r]/), getparserfunc("__list")), 0, 2);
export const list: parserfunc = symbol(
  seq(
    listitemnew,
    cascadedlist,
    multiple(seq(followedlist, cascadedlist)),
  ),
  "__list",
)

const br = symbol(match(/[\n\r]/), "br");

const paragraph = symbol(
  or(
    list,
    particleinmiddle(inline, br),
  ),
  "paragraph",
);

const newline: parserfunc = or(
  escape,
  title,
  horizonal,
  macroblock,
  macrowithoutbody,
  paragraph,
);

export const doc = getparser(particleinmiddle(
  newline,
  linebreak,
));

export function postprocess(tree: treeNode<generalNode>) {
  if (tree.childs.length > 0 && tree.childs[0].name == "__listitem") {
    let [restree] = listmerge(tree.childs, 1);
    tree.childs = [restree];
  }else if( tree.name == "__list"){
    const delimnode = tree.childs.at(0)?.childs.find((v) => (v.name == "__delim"))
    const match = delimnode?.raw.match(/(\*\.|\*|1.|;|:)$/)?.at(0);
    switch (match) {
      case "*":
      case "*.":
        tree.name = "ulist";
        break;
      case "1.":
        tree.name = "olist";
        break;
      case ";":
      case ":":
        tree.name = "dlist";
        break;
      default:
        tree.name = "list";
        break;
    }
    for (let i of tree.childs) {
      postprocess(i);
    }

  }else if( tree.name == "__listitemnew"){
    const delimnode = tree.childs.find((v) => (v.name == "__delim"))
    const match = delimnode?.raw.match(/(\*\.|\*|1.|;|:)$/)?.at(0);
    switch (match) {
      case "*":
      case "*.":
      case "1":
      case "1.":
        tree.name = "item";
        break;
      case ";":
        tree.name = "dt";
        break;
      case ":":
        tree.name = "dd";
        break;
      default:
        console.log(delimnode?.raw)
        tree.name = "item";
        break;
    }
    if(delimnode){
      tree.removechild(delimnode)
    }
    for (let i of tree.childs) {
      postprocess(i);
    }
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
