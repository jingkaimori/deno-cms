import { Processors } from "../../utils/processer.ts";
import { semanticsTreeNode } from "../../utils/treenode.ts";
import { getEditableTextNode } from "./index.ts";
import { getArticleTitle } from "./utility.ts";
type allowedHTMLNodeType = keyof HTMLElementTagNameMap | "box" | "warning" | "toc"


function mapToNode(name: allowedHTMLNodeType): processer {
    return function (_tree, output) {
        const node = document.createElement(name);
        output.append(node);
        return {
            resElem: node,
            mapType: MapType.Node
        };
    };
}
const mapToText: processer = (tree, output) => {
        const rawtext = tree.raw;
        const text = getEditableTextNode(rawtext)
        output.append(text);
        return {
            resElem: text,
            mapType: MapType.Text
        };
    };

const omitTreeNode: processer = (_i,r) => ({
    resElem: r,
    mapType: MapType.Omit
})

enum MapType {
    Node,
    Text,
    Omit
}

type processer = (
    iptTree: Readonly<semanticsTreeNode>,
    resParent: HTMLElement,
) => {resElem: HTMLElement, mapType: MapType};
const mappers = new Processors<{[key in string]:processer}>({
    "title": function name(tree, output) {
        // const match = tree.raw.match(/^=+/);
        // let lth = match?.at(0)?.length;
        const lth = tree.auxilary.level;
        if (typeof lth == "number") {
            const title = document.createElement("h" + lth.toString());
            output.append(title);
            return {
                resElem: title,
                mapType: MapType.Node
            };
        } else {
            const title = document.createElement("p");
            output.append(title);
            return {
                resElem: title,
                mapType: MapType.Node
            };
        }
    },
    "root": mapToNode("article"),
    "paragraph": mapToNode("p"),
    "ulist": mapToNode("ul"),
    "olist": mapToNode("ol"),
    "dlist": mapToNode("dl"),
    "item": mapToNode("li"),
    "list_item": mapToNode("li"),
    "dt": mapToNode("dt"),
    "dd": mapToNode("dd"),
    "br": mapToNode("br"),
    "template": mapToNode("box"),
    "template-warning": mapToNode("warning"),
    "template-code": mapToNode("code"),
    "code": mapToNode("pre"),
    "template-cite": mapToNode("cite"),
    "template-toc": mapToNode("toc"),
    "template-formula": (_tree, output) => {
        const title = document.createElement("formula");
        //let math = katex.__parse(tree.childs[0]?.raw,{});
        //console.log(math);
        output.append(title);
        return {
            resElem: title,
            mapType: MapType.Node
        };
    },
    "table":mapToNode("table"),
    "theadcell":mapToNode("th"),
    "trow":mapToNode("tr"),
    "tcell":mapToNode("td"),
    "linktext": omitTreeNode,
    "linkarticle": function (tree, output) {
        (output as HTMLAnchorElement).setAttribute(
            "href",
            getArticleTitle(tree.raw),
        );
        return {
            resElem: output,
            mapType: MapType.Omit
        };
    },
    "__plain": omitTreeNode,
    "concrete": omitTreeNode,
    "text": mapToText,
    "rawtext": mapToText,
    "titletext": mapToText,
    "link":  mapToNode("a"),
    "linkdest":(tree,output)=>{
        output.setAttribute("href", String( tree.raw));
        return {
            resElem: output,
            mapType: MapType.Omit
        };
    },
    "hint":(tree,output)=>{
        output.setAttribute("title", String( tree.raw));
        return {
            resElem: output,
            mapType: MapType.Omit
        };
    },
    "blockquote": mapToNode("blockquote"),
    "strong": mapToNode("strong"),
    "em": mapToNode("em"),
    "codespan": mapToNode("code"),
    "del": mapToNode("del"),
}, (i, r) => {
    console.warn("unknown node: " + i.name);
    console.info(i)
    return omitTreeNode(i,r);
});

export function mapNode(
    iptTree: semanticsTreeNode,
    resParent: HTMLElement,
    nodeMap: WeakMap<HTMLElement, semanticsTreeNode>,
    textMap: WeakMap<HTMLElement, semanticsTreeNode>,
): [HTMLElement] {
    //console.group(iptTree.parentNode?.nodeName)
    //console.info(`${iptTree.parentNode?.nodeName}->${iptTree.nodeName}`,resTree.nodeName)
    const passSelected = mappers.getProcessor(iptTree.name);
    const {resElem,mapType} = passSelected(iptTree, resParent);
    if (mapType == MapType.Node) {
        nodeMap.set(resElem,iptTree)
    } else if (mapType == MapType.Text) {
        textMap.set(resElem,iptTree)
    }
    for (const i of iptTree.childs) {
        mapNode(i, resElem, nodeMap, textMap);
    }
    return [resElem];
}

