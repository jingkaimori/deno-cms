import {
    generalNode,
    match,
    multiple,
    parserfunc,
    seq,
    symbol,
    treeNode,
} from "../macros/macros.ts";

import { followedlist, inline, listitemnew } from "./xwiki.ts";

export const list: parserfunc = function __list(str, context, stack, ev) {
    const cascadedlist = multiple(seq(match(/[\n\r]/), __list), 0, 2);
    return symbol(
        seq(
            listitemnew,
            cascadedlist,
            multiple(seq(followedlist, cascadedlist)),
        ),
        "__list",
    )(str, context, stack, ev);
};

export const listitem: parserfunc = symbol(
    seq(multiple(match(/[*1;.:]/), 1), inline),
    "__listitem",
);

export function postprocess(tree: treeNode<generalNode>) {
    if (tree.childs.length > 0 && tree.childs[0].name == "__listitem") {
        const [restree] = listmerge(tree.childs, 1);
        tree.removeallchilds();
        tree.appendchild(restree);
    } else if (tree.name == "__list") {
        const delimnode = tree.childs.at(0)?.childByName("__delim");
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
    } else if (tree.name == "__listitemnew") {
        const delimnode = tree.childByName("__delim");
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
                console.log(delimnode?.raw);
                tree.name = "item";
                break;
        }
        if (delimnode) {
            tree.removechild(delimnode);
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

function listmerge(
    iptArr: readonly treeNode[],
    level: number,
): [treeNode, number] {
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
            newNode.appendchilds(item.childs);
            resTree.appendchild(newNode);
            lastNode = newNode;
        } else if (lth > level) {
            const [subResTree, __skip] = listmerge(iptArr.slice(i), lth);
            skip = i + __skip;
            lastNode.appendchild(subResTree);
        } else if (lth < level) {
            return [resTree, i];
        }
    }
    return [resTree, iptArr.length];
}
