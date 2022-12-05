import { assertObjectMatch, } from "../deps.ts";
import { doc, escape, link, title } from "./xwiki.ts";
import { getparser } from "../macros/macros.ts";

Deno.test({
    name: "title() test",
    fn(): void {
        const titleparser = getparser(title);
        const res = titleparser("=== title ===")
        assertObjectMatch(res, {
            success: true,
            leftstr: "",
        });
        assertObjectMatch(
            res.tree.toPlainObject(),
            {
                childs:[
                    {
                        name:"title",
                        raw:"=== title ===",
                        childs:[
                            {
                                name:"titletext",
                                raw:" title ",
                                childs:[]
                            }
                        ],
                        auxilary:{
                            level:3
                        }
                    }
                ]
            }
        )
        assertObjectMatch(titleparser("=== title =="), {
            success: false,
            leftstr: "=== title ==",
        });
    },
});

Deno.test({
    name: "titled link() test",
    fn(): void {
        const res = getparser(link)("[[title >> url]]");
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
    name: "bare link() test",
    fn(): void {
        const res = getparser(link)("[[url]]");
        assertObjectMatch(res, {
            success: true,
            leftstr: "",
        });
        assertObjectMatch(res.tree.toPlainObject(), {
            childs: [{
                name: "link",
                childs: [
                    {
                        name: "__path",
                        raw: "url",
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
        const res = doc(
            "\
* c\n\
* e\n\
** ca\n\
** cb\n\
*** cca\n\
* frog\n\
* c\n",
        )
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
                childs: [
                    {
                        name: "ulist",
                        childs: [
                            {
                                name: "item",
                                childs: [
                                    {
                                        name: "text",
                                        raw: " c"
                                    }]
                            }, {
                                name: "item",
                                childs: [
                                    {
                                        name: "text",
                                        raw: " e"
                                    }, {
                                        name: "ulist"
                                    }]
                            }, {
                                name: "item",
                                childs: [
                                    {
                                        name: "text",
                                        raw: " frog"
                                    }]
                            }, {
                                name: "item",
                                childs: [
                                    {
                                        name: "text",
                                        raw: " c"
                                    }]
                            }]
                    }]
            })
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
                childs: [
                    {
                        name: "olist",
                        childs: [
                            {
                                name: "item",
                                childs: [
                                    {
                                        name: "text"
                                    }, {
                                        name: "olist"
                                    }
                                ]
                            }]
                    }]
            })
    },
});

Deno.test({
    name: "one tag macro() test",
    fn(): void {
        const res = doc(
            "{{toc attr=\"\" /}}",
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
                childs: [
                    {
                        name: "template",
                        childs: [
                            {
                                name: "__name"
                            },
                            {
                                name: "template-attr"
                            }]
                    }]
            })
        console.log(res.tree.toString());
    },
});


Deno.test({
    name: "escape() test",
    fn(): void {
        const parser = getparser(escape)
        const res = parser("{{{/abc}}}\n")
        assertObjectMatch(
            res,
            {
                success: true,
                leftstr: "\n"
            }
        )
        assertObjectMatch(
            res.tree.toPlainObject(),
            {
                childs: [
                    {
                        name: "rawtext",
                        raw: "/abc",
                        childs: []
                    }]
            }
        )
    }
})

Deno.test({
    name: "table() test",
    fn(): void {
        const res = doc(
            `|=任务 |=期限
|[[课程.工科数学分析.WebHome]]作业 |每周一
|[[课程.大学物理.WebHome]]作业 |每周
|[[imported.学术用途英语]]作业 |每周
|[[课程.电路分析基础.WebHome]]作业 |每周
|上线公共站 |本月内
`,
        );
        assertObjectMatch(
            res,
            {
                success: true,
                leftstr: "",
            },
        );
        console.log(res.tree.toPlainObject().childs)
        assertObjectMatch(
            res.tree.toPlainObject(),
            {
                childs: [
                    {
                        name: "table",
                        childs: [
                            {
                                name: "trow",
                                childs: [
                                    {
                                        name: "theadcell"
                                    }]
                            },
                            {
                                name: "trow",
                                childs: [
                                    {
                                        name: "tcell"
                                    }]
                            }]
                    }]
            })
        console.log(res.tree.toString());
    },
});


