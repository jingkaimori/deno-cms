import { semanticsTreeNode } from "../../macros/macros.ts";
import { Processors } from "../../utils/processer.ts";
type contextType = Record<string, any>;
type allowedHTMLNodeType = keyof HTMLElementTagNameMap | "box" | "warning" | "toc"


function mapToNode(name: allowedHTMLNodeType): processer {
    return function (_tree, output, _context) {
        const title = document.createElement(name);
        output.append(title);
        return [title];
    };
}
const mapToText: processer = (tree, output, _context) => {
        const rawtext = tree.raw;
        const text = document.createElement("span");
        text.innerText = rawtext;
        text.setAttribute("contenteditable","");
        output.append(text);
        return [output];
    };

const omitTreeNode: processer = (_i,r,_c) => [r]

type processer = (
    iptTree: Readonly<semanticsTreeNode>,
    resTree: HTMLElement,
    context: contextType,
) => [HTMLElement];
const mappers = new Processors<processer>({
    "title": function name(tree, output, _context) {
        // const match = tree.raw.match(/^=+/);
        // let lth = match?.at(0)?.length;
        const lth = tree.auxilary.level;
        if (typeof lth == "number") {
            const title = document.createElement("h" + lth.toString());
            output.append(title);
            return [title];
        } else {
            const title = document.createElement("p");
            output.append(title);
            return [title];
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
    "template-formula": (_tree, output, _context) => {
        let title = document.createElement("formula");
        //let math = katex.__parse(tree.childs[0]?.raw,{});
        //console.log(math);
        output.append(title);
        return [title];
    },
    "table":mapToNode("table"),
    "theadcell":mapToNode("th"),
    "trow":mapToNode("tr"),
    "tcell":mapToNode("td"),
    "linktext": omitTreeNode,
    "linkarticle": function (tree, output, _context) {
        (output as HTMLAnchorElement).setAttribute(
            "href",
            getArticleTitle(tree.raw),
        );
        return [output];
    },
    "__plain": omitTreeNode,
    "concrete": omitTreeNode,
    "text": mapToText,
    "rawtext": mapToText,
    "titletext": mapToText,
    "link":  mapToNode("a"),
    "linkdest":(tree,output)=>{
        output.setAttribute("href", String( tree.raw));
        return [output]
    },
    "hint":(tree,output)=>{
        output.setAttribute("title", String( tree.raw));
        return [output]
    },
    "blockquote": mapToNode("blockquote"),
    "strong": mapToNode("strong"),
    "em": mapToNode("em"),
    "codespan": mapToNode("code"),
    "del": mapToNode("del"),
}, (i, r, c) => {
    console.warn("unknown node: " + i.name);
    console.info(i)
    return omitTreeNode(i,r,c);
});

export function mapNode(
    iptTree: Readonly<semanticsTreeNode>,
    resTree: HTMLElement,
    contextStack: contextType[],
    renderMap: WeakMap<HTMLElement, semanticsTreeNode>,
): [HTMLElement, contextType] {
    //console.group(iptTree.parentNode?.nodeName)
    //console.info(`${iptTree.parentNode?.nodeName}->${iptTree.nodeName}`,resTree.nodeName)
    const passSelected = mappers.getProcessor(iptTree.name);
    const context = contextStack.reduce(
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
        for (const i of iptTree.childs) {
            mapNode(i, resTree, contextStack, renderMap);
        }
    }
    //console.groupEnd()
    return [resTree, context];
}

export function getArticleTitle(filename: string) {
    return ("./export/" + filename.replace(/\./g, "/") + ".xml");
}
