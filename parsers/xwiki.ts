import { semanticsTreeNode } from "../utils/treenode.ts";
import {
    empty,
    eq,
    getparser,
    getparserfunc,
    match,
    multiple,
    neq,
    not,
    or,
    parser,
    parserfunc,
    seq,
    symbol,
    scope,
    modifycontext,
} from "./macros/macros.ts";

const whitespace: parserfunc = multiple(match(/[\t ]/), 1);

const linebreak: parserfunc = multiple(match(/[\n\r]/), 1);

const titletext: parserfunc = symbol(
    particleinmiddle(
        multiple(match(/[^\n\r=]/), 1),
        eq("="),
    ),
    "titletext",
);

type titleContext = {
    titledepth:number
}

const titleinner: parserfunc<titleContext> = 
modifycontext<titleContext>(seq(
    eq("="),
    or(getparserfunc(()=>(titleinner)), titletext),
    eq("="),
),(context)=>{context.titledepth += 1})

export const title: parserfunc = scope<titleContext>(
    symbol(
        titleinner,
        "title",
        (context)=>{
            const res = {
                level:context.titledepth
            }
            return res;
        }
    ),(context)=>{
        const newcontext = context as titleContext
        newcontext.titledepth = 0
        return newcontext;
});


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
        seq(
            eq(">>"),
            path,
        ),
        eq("]]"),
    ),
    "link",
);

export const urllink: parserfunc = symbol(
    seq(
        eq("[["),
        path,
        eq("]]"),
    ),
    "link",
);

export const link: parserfunc = or(
    hyperlink,urllink
)

export const plainchar: parserfunc = match(/[^\n\r\[]/);

export const escape: parserfunc = seq(
    eq("{{{"),
    symbol(
        multiple(neq("}}}")),
        "rawtext",
    ),
    eq("}}}")
);

const escapechar: parserfunc = seq(
    eq("~"),
    symbol(not(empty), "rawtext"),
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

type macroContext = {
    name: string,
    attr: {
        [key in string] : string | number
    }
}

function macroScope(def:parserfunc<macroContext>):parserfunc {
    return scope(
        symbol(
            def,
            (_, context)=> {
                console.log(context)
                if (context.name !== "") {
                    return "template-" + context.name
                } else {
                    return "template"
                }
            }
        ),
        (context)=>{
            const newcontext = context as macroContext
            newcontext.name = '';
            return newcontext;
        }
    )
}

/**
 * @todo extract attribute
 */
const macroattr: parserfunc = seq(
    whitespace,
    multiple(
        symbol(
            not(or(eq("}}"), eq("/}}"), linebreak, empty)),
            "template-attr")),
);

const macroname = modifycontext<macroContext>(
    match(/^[^ \/{}\n]*/)
    ,(context,str)=>{
        context.name = str
    });

const macrobegin = seq(
    eq("{{"),
    macroname,
    multiple(
        not(or(eq("}}"), eq("/}}"), linebreak, empty))),
    eq("}}"),
);

const macroend = seq(
    eq("{{/"),
    eq<macroContext>((_,context) => {
        console.log(context)
        return context.name;
    }),
    eq("}}"),
);

const macrobody: parserfunc = symbol(
    multiple(neq("{{")),
    "macro-body",
);

export const macrowithoutbody: parserfunc = macroScope(
    seq(
        eq("{{"),
        macroname,
        multiple(
            not(or(eq("}}"), eq("/}}"), linebreak, empty))),
        eq("/}}"),
    ),
);

const macroblock: parserfunc = macroScope(
    seq(macrobegin, macrobody, macroend),
);

const macroinlinebody: parserfunc = symbol(
    multiple(not(or(eq("{{"), eq("\n"), empty))),
    "macro-body",
);

const macroinline: parserfunc = macroScope(
    seq(macrobegin, macroinlinebody, macroend),
);

const pseudomacrobegin = seq(
    eq("{{"),
    match(/^[^ \/{}\n]*/),
    multiple(
        not(or(eq("}}"), eq("/}}"), linebreak, empty))),
    eq("}}"),
);

export const plain: parserfunc = symbol(
    multiple(
        not(or(link, escape, escapechar, pseudomacrobegin, linebreak, empty)),
        1,
    ),
    "text",
);

export const inline: parserfunc = multiple(
    or(
        link,
        macroinline,
        macrowithoutbody,
        escape,
        escapechar,
        plain,
    ),
    1,
);

type listContext={
    listdepth:number
}
const delimpattern = match(/(\*\.|\*|1\.|1|;|:)/);

export const followeditem: parserfunc<listContext> = symbol(
    seq(
        symbol(
            multiple<listContext>(
                delimpattern,
                (_,context) => (context.listdepth ),
                (_,context) => (context.listdepth + 1)
            ),"__delim"
        ),
        inline,
        match(/[\n\r]/),
        multiple(getparserfunc(()=>(sublist)),0,2)
    ),
    "__listitemnew"
)

export const firstitem:parserfunc<listContext> = symbol(
    seq(
        symbol(
            multiple<listContext>(
                delimpattern,
                (_,context) => (context.listdepth +1),undefined,
                (context,times)=>{
                    context.listdepth = times
                }
            ),"__delim"
        ),
        inline,
        match(/[\n\r]/),
        multiple(getparserfunc(()=>(sublist)),0,2)
    ),
    "__listitemnew"
)

export const sublist: parserfunc<listContext> = 
symbol(
    scope<listContext,listContext>(
    seq(
        firstitem,
        multiple(followeditem)
    ),(context)=>context
    ),"__list"
)

export const list: parserfunc = scope<listContext>(
    sublist,
    (context)=>{
        const newcontext = context as listContext
        newcontext.listdepth = 0
        return newcontext
    }
);

const br = symbol(match(/[\n\r]/), "br");

const tableinline: parserfunc = multiple(
    or(
        link,
        macroinline,
        macroblock,
        macrowithoutbody,
        escape,
        escapechar,
        symbol(
            multiple(
                not(or(
                    link,
                    escape,
                    escapechar,
                    macroinline,
                    macroblock,
                    macrowithoutbody,
                    eq("|"),
                    linebreak,
                    empty,
                )),
                1,
            ),
            "text",
        ),
    ),
);
const tablecell = seq(
    eq("|"),
    symbol(
        tableinline,
        "tcell",
    ),
);

const tableheadcell = seq(
    eq("|="),
    symbol(
        tableinline,
        "theadcell",
    ),
);

const tablerow = symbol(
    seq(multiple(or(tableheadcell, tablecell)), linebreak),
    "trow",
);

const table = symbol(
    multiple(tablerow,1),
    "table",
);

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
    list,
    table,
    paragraph,
);

export const doc: parser = (str) => {
    const res = getparser(multiple(or(
        newline,
        linebreak,
    )))(str);
    postprocess(res.tree);
    return res;
};

function postprocess(tree: semanticsTreeNode) {
    if (tree.name == "__list") {
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
    } else if (tree.name == "link") {
        const pathnode = tree.childByName("__path")
        if (pathnode !== undefined) {
            const res = /^url:(.*)/.exec(pathnode.raw)
            if (res) {
                pathnode.name = "linkdest"
                pathnode.raw = res[1]
            } else {
                pathnode.name = "linkarticle";
            }
        }
        const labelnode = tree.childByName("__label")
        if(labelnode!== undefined){
            labelnode.name = "text"
        }
    } else { /* nothing */ }

    for (const i of tree.childs) {
        postprocess(i);
    }
}
