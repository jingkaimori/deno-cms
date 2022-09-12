import type {
    semanticsTreeNode,
    parser,
    parserevent,
    rootTreeNode,
} from "../../macros/macros.ts";
import { treeNode } from "../../macros/macros.ts";
import { Processors } from "../../utils/processer.ts";

export const doc: parser = (str) => {
    const parser = new DOMParser();
    const tree = parser.parseFromString(str, "text/xml");
    removeBlankText(tree);
    const events: parserevent[] = [];
    const [displayTree] = mapNode(
        tree.cloneNode(true),
        new treeNode("root"),
        [{ mode: "none" }],
        events,
    );
    return {
        tree: displayTree as rootTreeNode,
        stack: [],
        success: true,
        leftstr: "",
        events,
    };
};

export const metadata = (str: string) => {
    const parser = new DOMParser();
    const tree = parser.parseFromString(str, "text/xml");
    removeBlankText(tree);
    const res: Partial<metadataType> = {};
    scanMetaInfo(tree, res);
    return res;
};

/**
 * remove blank text nodes
 */
function removeBlankText(tree: Node): void {
    //childNodes is dynamic, remove after scan to count all nodes.
    const removedChilds = [];
    for (const i of tree.childNodes) {
        if (i.nodeType == Node.TEXT_NODE) {
            if (i.nodeValue === null) {
                removedChilds.push(i);
            } else if (/^\s*$/.test(i.nodeValue)) {
                removedChilds.push(i);
            }
        } else {
            removeBlankText(i);
        }
    }
    removedChilds.every(tree.removeChild, tree);
}

const scanMetaInfo = <T>(tree: Node, context: T): T => {
    // console.group()
    const passSelected = dataMappers.getProcessor(tree.nodeName);
    let nextContext: T | T[keyof T] = context;
    nextContext = passSelected(tree, context);

    // console.log(context)
    // console.groupEnd()
    for (const i of tree.childNodes) {
        scanMetaInfo(i, nextContext);
    }
    return context;
};

export type metadataType = {
    docinfo?: {
        title: string;
        authorlist?: {
            name: string;
        }[];
    };
    tmVersion: string;
};

type passType = (tree: Node, context: Record<string, any>) => any;

const dataMappers = new Processors<passType>(
    {
        "doc-data": function (_, data) {
            if (!data.docinfo) {
                data.docinfo = {};
            }
            return data.docinfo;
        },
        "doc-title": function (t, data) {
            data.title = t.firstChild?.nodeValue ?? "";
            return data;
        },
        "doc-author": function (_, data) {
            data.authorlist = [];
            return data;
        },
        "author-data": function (_, data) {
            const newauthor = {};
            data.authorlist.push(newauthor);
            return newauthor;
        },
        "author-name": function (t, data) {
            data.name = t.firstChild?.nodeValue ?? "";
            return data;
        },
        "TeXmacs": function (t, data) {
            if (t.hasChildNodes()) {
                const version = (t as Element).getAttribute("version") ?? "";
                data.tmVersion = version;
            } else { /** do nothing */ }

            return data;
        },
        "style": function (t, data) {
            //            <style>.<tuple>
            const tuple = t.firstChild;
            data.packs = [];
            if (tuple) {
                for (let i = 0; i < tuple.childNodes.length; i++) {
                    //           <tuple>.<tm-args>     .#text
                    const config: string =
                        tuple.childNodes[i]?.firstChild?.nodeValue ?? "";
                    if (i == 0) {
                        data.style = config;
                    } else {
                        data.packs.push(config);
                    }
                }
            }
            return data;
        },
        "initial": function (t, data) {
            data.env = {};
            //                 <initial>.<collection>
            const collection = t.firstChild;
            if (collection?.childNodes) {
                //        <associate>
                for (const i of collection.childNodes) {
                    //         = <associate>.<tm-args>     .#text
                    const name = i.childNodes[0]?.firstChild?.nodeValue ?? "";
                    //          = <associate>.<tm-args>     .#text
                    const value = i.childNodes[0]?.firstChild?.nodeValue ?? "";
                    data.env[name] = value;
                }
            }
            return data;
        },
    },
    (_, data) => data,
);

type contextType = Record<string, any>;
type renderPassType = (
    tree: Node,
    output: semanticsTreeNode,
    context: Readonly<contextType>,
) => [semanticsTreeNode, contextType | undefined, parserevent] | [
    semanticsTreeNode,
    contextType,
] | [semanticsTreeNode];

const renderMappers = new Processors<renderPassType>(
    {
        "TeXmacs": function passTexmacsRoot(tree, output, _context) {
            const removedChilds = [];
            for (const i of tree.childNodes) {
                //console.log(i,tree.childNodes)
                switch (i.nodeName) {
                    case "style":
                    case "references":
                    case "auxiliary":
                    case "initial":
                        removedChilds.push(i);
                }
            }
            removedChilds.every(tree.removeChild, tree);
            return [output];
        },
        // TODO: META INFO
        "#document": function passRoot(_tree, output, _context) {
            return [output];
        },
        "body": function name(_tree, output, _context) {
            //context["mode"] = "text"
            //output.append(...tree.childNodes);
            return [output, { mode: "text" }];
        },
        "doc-title": function (_tree, output, _context) {
            const par = new treeNode("title");
            par.auxilary = {
                level: 1,
            };
            output.appendchild(par);
            return [par];
        },
        "section": function name(_tree, output, _context) {
            const par = new treeNode("title");
            par.auxilary = {
                level: 2,
            };
            output.appendchild(par);
            return [par];
        },
        "subsection": function name(_tree, output, _context) {
            const par = new treeNode("title");
            par.auxilary = {
                level: 3,
            };
            output.appendchild(par);
            return [par];
        },
        "subsubsection": function name(_tree, output, _context) {
            const par = new treeNode("title");
            par.auxilary = {
                level: 4,
            };
            output.appendchild(par);
            return [par];
        },
        "#text": function passText(tree, output, context) {
            const rawtext = tree.nodeValue;
            if (rawtext !== null) {
                if (context.mode == "text") {
                    const text = new treeNode("text");
                    text.raw = rawtext;
                    output.appendchild(text);
                } else if (context.mode == "math") {
                    // TODO: parse symbols operators and numbers in formula
                    const text = new treeNode("text");
                    text.raw = rawtext;
                    output.appendchild(text);
                }
            }
            return [output];
        },
        "nbsp": function (_tree, output, _context) {
            const text = new treeNode("text");
            text.raw = " ";
            output.appendchild(text);
            return [output];
        },
        "tm-sym": function passSymbolText(tree, output, _context) {
            const matched = tree.firstChild?.nodeValue?.match(
                /#([0-9a-zA-Z]*)/,
            );
            if (matched && matched[1]) {
                const text = new treeNode("text");
                text.raw = String.fromCodePoint(
                    Number.parseInt(matched[1], 16),
                );
                output.appendchild(text);
                tree.removeChild(tree.firstChild as Node);
            } else {
                //TODO: Alphabet text entity
            }
            return [output];
        },
        /**
         * \<tm-par>\</tm-par> == <\document>, multiline content(TeXMacs) or flow content(HTML)
         */
        "tm-par": function passParagraph(_tree, output, context) {
            if (context.mode == "text") {
                const text = new treeNode("paragraph");
                output.appendchild(text);
                return [text];
            } else if (context.mode == "math") {
                return [output];
            } else {
                return [output];
            }
        },
        /** it's hard to render mathml in all browser with spetial edit requirement */
        "equation_42_": function (_tree, output, _context) {
            const math = new treeNode("math");
            output.appendchild(math);
            // let math = document.createElementNS("http://www.w3.org/1998/Math/MathML","math")
            // math.setAttribute("display","block")
            // output.append(math)
            // // let param = tree.firstChild
            // // math.append(...param.childNodes)
            return [math, { mode: "math" }];
        },
        "rsub": function (_tree, output, _context) {
            const sub = new treeNode("subscript");
            output.appendchild(sub);
            return [sub];
        },
        "rsup": function (_tree, output, _context) {
            const sub = new treeNode("subscript");
            output.appendchild(sub);
            return [sub];
        },
    },
    function (iptTree, resTree, _context) {
        const unknown = new treeNode("unknown");
        unknown.raw = iptTree.nodeName;
        resTree.appendchild(unknown);
        return [unknown, undefined, {
            type: "Unknown node",
            desc: "Unknown node:" + iptTree.nodeName,
            context: [],
        }];
    },
);

/**
 * map TMML node to Parser node
 * @todo give passed tree to subnode or raw tree?
 */
function mapNode(
    iptTree: Node,
    resTree: semanticsTreeNode,
    contextStack: Array<contextType>,
    eventlist: parserevent[],
): [semanticsTreeNode, contextType] {
    //console.group(iptTree.parentNode?.nodeName)
    //console.info(`${iptTree.parentNode?.nodeName}->${iptTree.nodeName}`,resTree.nodeName)
    const passSelected = renderMappers.getProcessor(iptTree.nodeName);
    const context = contextStack.reduce(
        (pre, cur) => {
            return Object.assign(pre, cur);
        },
        {},
    );
    let newScope = undefined, parserev: parserevent | undefined;
    [resTree, newScope, parserev] = passSelected(iptTree, resTree, context);
    if (newScope !== undefined) {
        contextStack.push(newScope);
    } else { /* do nothing */ }

    if (parserev !== undefined) {
        eventlist.push(parserev);
    } else { /* do nothing */ }

    for (const i of iptTree.childNodes) {
        mapNode(i, resTree, contextStack, eventlist);
    }
    //console.groupEnd()
    return [resTree, context];
}
