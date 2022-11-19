import { assertObjectMatch, } from "../deps.ts";
import { doc, hyperlink, title, titletext } from "./xwiki.ts";
import { getparser } from "../macros/macros.ts";

Deno.test({
    name: "title() test",
    fn(): void {
        const titleparser = getparser(title);
        assertObjectMatch(titleparser("=== title ==="), {
            success: true,
            leftstr: "",
        });
        assertObjectMatch(titleparser("=== title =="), {
            success: false,
            leftstr: "=== title ==",
        });
    },
});
Deno.test({
    name: "titletext() test",
    fn(): void {
        const titletextparser = getparser(titletext);
        assertObjectMatch(titletextparser(" title "), {
            success: true,
            leftstr: "",
        });
        assertObjectMatch(titletextparser(" title ="), {
            success: true,
            leftstr: "=",
        });
        assertObjectMatch(titletextparser("= title "), {
            success: false,
            leftstr: "= title ",
        });
    },
});

Deno.test({
    name: "hyperlink() test",
    fn(): void {
        const res = getparser(hyperlink)("[[title >> url]]");
        assertObjectMatch(res, {
            success: true,
            leftstr: "",
        });
        assertObjectMatch(res.tree.toPlainObject(), {
            childs: [{
                    name: "link",
                    childs: [{
                            name: "__label",
                            raw: "title ",
                        },
                        {
                            name: "__path",
                            raw: " url",
                        },
                    ],
                },
            ],
        });
    },
});

Deno.test({
    name: "list() test",
    fn(): void {
        assertObjectMatch(
            doc(
"\
* c\n\
* e\n\
** ca\n\
** cb\n\
*** cca\n\
* c\n\
* c\n",
            ),
            {
                success: true,
                leftstr: "",
            },
        );
    },
});
Deno.test({
    name: "ordered list() test",
    fn(): void {
        const res = doc(
"\
1. 设置领地：\n\
11. 先用一块木头斧子左键敲击一方块设置点A，\n",
        );
        assertObjectMatch(
            res,
            {
                success: true,
                leftstr: "",
            },
        );
        console.log(res.tree.toString())
        assertObjectMatch(
            res.tree.toPlainObject(),
            {
                childs:[{
                        name:"olist",
                        childs:[{
                                name:"item",
                                childs:[{
                                        name:"text"
                                    }
                                ]
                            },
                            {
                                name:"olist"
                            }
                        ]
                    }
                ]
            }
        )
    },
});
Deno.test({
    name: "macro() test",
    fn(): void {
        const res = doc(
            "{{toc/}}",
        );
        assertObjectMatch(
            res,
            {
                success: true,
                leftstr: "",
            },
        );
        assertObjectMatch(
            res.tree.toPlainObject(),
            {
                childs:[{
                        name:"template",
                        childs:[]
                    }
                ]
            }
        )
        console.log(res.tree.toString());
    },
});
