import {
    empty,
    eq,
    semanticsTreeNode,
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

export const title: parserfunc = symbol(
    seq(
        eq("="),
        or(getparserfunc(()=>(title)), titletext),
        eq("="),
    ),
    "title",
);

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

const escapetext: parserfunc = symbol(multiple(neq("}}}")), "__plain");
const escape: parserfunc = symbol(
    seq(eq("{{{"), escapetext, eq("}}}")),
    "rawtext",
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
        const namenode = context.childByName("__name");
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
    multiple(not(or(eq("{{"), eq("\n"), empty))),
    "__plain",
);

const macroinline: parserfunc = symbol(
    seq(macrobegin, macroinlinebody, macroend),
    "template",
);

export const plain: parserfunc = symbol(
    multiple(
        not(or(link, escape, escapechar, macrobegin, linebreak, empty)),
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
const delimpattern = match(/(\*\.|\*|1\.|1|;|:)/);

export const followeditem: parserfunc = symbol(
    seq(
        symbol(
            multiple(
                delimpattern,
                (_,context) => (Number(context?.listdepth) ),(_,context) => (Number(context?.listdepth) + 1)
            ),"__delim"
        ),
        inline,
        match(/[\n\r]/),
    ),
    "__listitemnew"
)

export const firstitem:parserfunc = symbol(
    seq(
        symbol(
            multiple(
                delimpattern,
                (_,context) => (Number(context?.listdepth) +1),undefined,
                (context,times)=>{
                    context.listdepth = times
                }
            ),"__delim"
        ),
        inline,
        match(/[\n\r]/),
    ),
    "__listitemnew"
)

export const sublist: parserfunc = 
symbol(
    scope(
    seq(
        firstitem,
        multiple(
            or(followeditem, getparserfunc(()=>(sublist))))
    ),()=>{}
    ),"__list"
)

export const list: parserfunc = scope(
    sublist,
    (context)=>{
        context.listdepth = 0
    }
);

const br = symbol(match(/[\n\r]/), "br");

const tableinline: parserfunc = multiple(
    or(
        link,
        macroinline,
        macrowithoutbody,
        escape,
        escapechar,
        symbol(
            multiple(
                not(or(
                    link,
                    escape,
                    escapechar,
                    macrobegin,
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
    const res = getparser(particleinmiddle(
        newline,
        linebreak,
    ))(str);
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
    } else { /* nothing */ }

    for (const i of tree.childs) {
        postprocess(i);
    }
}
