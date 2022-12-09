import { assertObjectMatch, } from "../deps.ts";
import { doc, escape, link, title } from "./xwiki.ts";
import { getparser } from "./macros/macros.ts";

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

const fulldoc = `
= Editing =

== Links ==

=== 1.0 Links ===

|=(% style="width:20%" %)Feature|=XWiki Syntax 1.0|=(% style="width:20%" %)Result
|Link to a page in the current Space|{{{[WebHome]}}}|[[Web Home>>WebHome]]
|Link with a label|{{{[label>WebHome]}}}|[[label>>WebHome]]
|Link with XWiki Syntax in the label|{{{<a href="$xwiki.getURL("WebHome")"><strong>bold label</strong></a>}}}|[[**bold label**>>WebHome]]
|Link to a page with the space specified|{{{[Main.WebHome]}}}|[[Web Home>>XWIKIGuide.WebHome]]
|Link to a subwiki|{{{[subwiki:Main.WebHome]}}}|[[Web Home>>XWIKIGuide.WebHome]]
|Link that opens in a new window|{{{[label>WebHome>_blank]}}}|[[label>>WebHome||target="_blank"]]
|Link to a URL directly in the text|{{{This is a URL: http://xwiki.org}}}|This is a URL: http://xwiki.org
|Link to a URL|{{{[http://xwiki.org]}}}|[[http://xwiki.org]]
|Link to a URL with a label|{{{[XWiki>http://xwiki.org]}}}|[[XWiki>>http://xwiki.org]]
|Link to an email address|{{{[john@smith.net>mailto:john@smith.net]}}}|[[john@smith.net>>mailto:john@smith.net]]
|Image Link|{{{<a href="$xwiki.getURL("Space1.Page1")">{image:img.png|document=Space2.Page2}</a>}}}|[[image:XWiki.XWikiSyntaxLinks@img.png>>XWIKIGuide.WebHome]]
|Image Link with image parameters|{{{<a href="$xwiki.getURL("Space1.Page1")">{image:img.png|document=Space2.Page2|width=26|height=26}</a>}}}|[[[[image:XWiki.XWikiSyntaxLinks@img.png||width="26" height="26"]]>>XWIKIGuide.WebHome]]
|Link to an attachment on the current page|(((
{{info}}See [[Attach Macro>>http://extensions.xwiki.org/xwiki/bin/view/Extension/Attach+Macro+%28Radeox%29]] for details{{/info}}
{{{{attach:text|file=img.png}}}}
)))|[[text>>attach:XWiki.XWikiSyntaxLinks@img.png]]
|Link to an attachment in a different page|(((
{{info}}See [[Attach Macro>>http://extensions.xwiki.org/xwiki/bin/view/Extension/Attach+Macro+%28Radeox%29]] for details{{/info}}
{{{{attach:text|document=Space.Page|file=img.png}}}}
)))|[[text>>attach:XWiki.XWikiSyntaxLinks@img.png]]
|Link to an Anchor in a page|{{{[label>Space.Page#anchor]}}}|[[label>>XWiki.XWikiSyntax||anchor="anchor"]]
|Link to a Heading in a page|(((
{{{[label>Space.Page#HMyheading]}}}
)))|[[label>>XWiki.XWikiSyntax||anchor="HMyheading"]]

{{info}}
When you add a Heading, an anchor named "H" followed by the heading title with only alpha characters is created. For example, for a Heading named "My heading", the generated anchor will be "HMyheading".
{{/info}}

{{velocity}}
$subHeading XWiki Syntax 1.0 Link Specification $subHeading
{{/velocity}}

{{info}}
Part in ##( )## is required, parts in ##[ ]## are optional and one of the two chars in ##{ }## needs to be added if optional parts are being used.
{{/info}}

The full format of a link is **##[label {> or |}] (resource) [@interWikiAlias] [{> or |} target]##**

* **##label##**: An optional string which will be displayed to the user as the link name when rendered. Example: ##My Page##
* **##resource##**: The full link reference using the following syntax: **##(reference) [?queryString] [#anchor]##**
** **##reference##**: The link reference. This can be either
*** **A URI** in the form **##protocol:path##** (examples: ##http:~/~/xwiki.org##, ##mailto~:john@smith.com##), or
*** **A wiki page** reference in the form **##~[~[wikiName:] spaceNameList.] (pageName)##**. Examples: ##WebHome##, ##Main.WebHome##, ##mywiki:Main.WebHome##
**** **##wikiName##**: An optional string containing the name of a virtual wiki. The link will point to a page inside that virtual wiki. Example: ##mywiki##
**** **##spaceNameList##**: An optional dot-separated list of wiki Space names. If no space is specified the current space is used. Examples: ##Main##, ##A.B##, ##A.B.C##
**** **##pageName##**: A required string containing the name of the linked wiki page. Example: ##WebHome##
** **##queryString##**: An optional query string for specifying parameters that will be used in the rendered URL. Example: ##mydata1=5&mydata2=Hello##
** **##anchor##**: An optional anchor name pointing to an anchor defined in the referenced link. Note that in XWiki anchors are automatically created for headings. Example: ##HTableOfContents##
* **##interWikiAlias##**: An optional [[Inter Wiki>>http://en.wikipedia.org/wiki/InterWiki]] alias as defined in the InterWiki Map (see the [[Admin Guide>>http://www.xwiki.org/xwiki/bin/view/Documentation/AdminGuide/]]). This is only valid for wiki page names. Example: ##wikipedia##
* **##target##**: An optional string corresponding to the HTML ##target## attribute for a HTML ##A## link element. This element is used when rendering the link. It defaults to opening the link in the current window. Examples: ##_self##, ##_blank##

=== 2.0 Links ===

|=(% style="width:20%" %)Feature|=XWiki Syntax 2.0|=(% style="width:20%" %)Result
|Link to a page in the current Space|{{{[[WebHome]]}}}|[[WebHome]]
|Link with a label|(((
{{{[[label>>WebHome]]}}}
{{info}}XWiki Syntax is supported inside link labels.{{/info}}
)))|[[label>>WebHome]]
|Link with XWiki Syntax in the label|{{{[[**bold label**>>WebHome]]}}}|[[**bold label**>>WebHome]]
|Link to a page with the space specified|{{{[[Main.WebHome]]}}}|[[XWIKIGuide.WebHome]]
|Link to a subwiki|{{{[[subwiki:Main.WebHome]]}}}|[[XWIKIGuide.WebHome]]
|Link that opens in a new window|{{{[[label>>WebHome||target="_blank"]]}}}|[[label>>WebHome||target="_blank"]]
|Link to a URL directly in the text|{{{This is a URL: http://xwiki.org}}}|This is a URL: http://xwiki.org
|Link to a URL|{{{[[http://xwiki.org]]}}}|[[http://xwiki.org]]
|Link to a URL with a label|{{{[[XWiki>>http://xwiki.org]]}}}|[[XWiki>>http://xwiki.org]]
|Link to an email address|{{{[[john@smith.net>>mailto:john@smith.net]]}}}|[[john@smith.net>>mailto:john@smith.net]]
|Image Link|{{{[[image:Space2.Page2@img.png>>Space1.Page1]]}}}|[[image:XWiki.XWikiSyntaxLinks@img.png>>XWIKIGuide.WebHome]]
|Image Link with image parameters|{{{[[[[image:Space2.Page2@img.png||width="26" height="26"]]>>Space1.Page1]]}}}|[[[[image:XWiki.XWikiSyntaxLinks@img.png||width="26" height="26"]]>>XWIKIGuide.WebHome]]
|Link to an attachment on the current page|{{{[[text>>attach:img.png]]}}}|[[text>>attach:XWiki.XWikiSyntaxLinks@img.png]]
|Link to an attachment in a different page|{{{[[text>>attach:Space.Page@img.png]]}}}|[[text>>attach:XWiki.XWikiSyntaxLinks@img.png]]
|Link to an Anchor in a page|{{{[[label>>Space.Page#anchor]]}}}|[[label>>XWiki.XWikiSyntax||anchor="anchor"]]
|Link to a Heading in a page|{{{[[label>>Space.Page#HMyheading]]}}}|[[label>>XWiki.XWikiSyntax||anchor="HMyheading"]]
|Link to an Anchor in the current page|{{{[[label>>#anchor]]}}}|[[label>>||anchor="anchor"]]

{{info}}
When you add a Heading, an anchor named "H" followed by the heading title with only alpha characters is created. For example, for a Heading named "My heading", the generated anchor will be "HMyheading".
{{/info}}

{{velocity}}
$subHeading XWiki Syntax 2.0 Link Specification $subHeading
{{/velocity}}

{{info}}
The part in ##( )## is required, while the parts in ##[ ]## are optional.
{{/info}}

The full format of a link is **##[label>>] (resource) [@interWikiAlias] [||parameters]##**

* **##label##**: An optional string which will be displayed to the user as the link name when rendered. The label may contain XWiki Syntax. If no label is specified a default label will be generated. The generation pattern can be changed, see the [[Admin Guide>>http://www.xwiki.org/xwiki/bin/view/Documentation/AdminGuide/]]. Example: ##My Page##
* **##resource##**: The full link reference using the following syntax: **##(reference) [?queryString] [#anchor]##**
** **##reference##**: The link reference in one of the following forms:
*** **URL**: Any URL in the form of **##protocol:~/~/path##**. Examples: ##http:~/~/xwiki.org##, ##https:~/~/svn.xwiki.org/##
*** **Wiki page** reference in the form **##~[~[wikiName:] spaceNameList.] (pageName)##**. Examples: ##WebHome##, ##Main.WebHome##, ##mywiki:Main.WebHome##
**** **##wikiName##**: An optional string containing the name of a virtual wiki. The link will point to a page inside that virtual wiki. Example: ##mywiki##
**** **##spaceNameList##**: An optional dot-separated list of wiki Space names. If no space is specified the current space is used. Examples: ##Main##, ##A.B##, ##A.B.C##
**** **##pageName##**: A required string containing the name of the linked wiki page. Example: ##WebHome##
*** **Attachment** reference in the form **##attach~: [wikiPageName@] (attachmentName)##**. Examples: ##attach~:img.png##, ##attach~:mywiki:Main.WebHome@img.png##
**** **##attach~:##** A required string identifying the resource as attachment.
**** **##wikiPageName##**: An optional string referencing the page that holds the attachment, see "Wiki page" above.
**** **##attachmentName##**: Name of the attachment as it is stored in the wiki.
*** **Email address** in the form **##mailto~: (emailAddress)##** (###anchor## is not valid). Example: ##mailto~:john@smith.com##
**** **##mailto~:##** A required string identifying the resource as email.
**** **##emailAddress##**: Targeted email address. Example: "##john@smith.com##"
** **##queryString##**: An optional query string for specifying parameters that will be used in the rendered URL. Example: ##mydata1=5&mydata2=Hello##
** **##anchor##**: An optional anchor name pointing to an anchor defined in the referenced link. Note that in XWiki anchors are automatically created for headings. Example: ##HTableOfContents##
* **##interWikiAlias##**: An optional [[Inter Wiki>>http://en.wikipedia.org/wiki/InterWiki]] alias as defined in the InterWiki Map (see the [[Admin Guide>>http://www.xwiki.org/xwiki/bin/view/Documentation/AdminGuide/]]). This is only valid for wiki page names. Example: ##wikipedia##
* **##parameters##**: An optional list of parameters passed to the link. Example: ##target="_blank"## (open in new window)

=== 2.1 Links ===

|=Feature|=XWiki Syntax 2.1|=Result
|Absolute link to page ##PageB## located in ##PageA##|{{{[[PageA.PageB]]}}}|[[PageB>>]]
|Relative link to page ##PageA## from the current page|{{{[[PageA]]}}} or {{{[[.PageA]]}}}|[[PageA>>]]
|Relative link to page ##PageB## in ##PageA## from the current page|{{{[[.PageA.PageB]]}}}|[[PageB>>]]
|Link with a label|(((
{{{[[label>>PageA]]}}}

{{info}}
XWiki Syntax is supported inside link labels.
{{/info}}
)))|[[label>>]]
|Link with wiki syntax in the label|{{{[[**bold label**>>PageA]]}}}|[[**bold label**>>]]
|Link on an image|{{{[[image:PageA@img.png>>PageA]]}}}|[[image:XWiki.XWikiSyntaxLinks@img.png>>]]
|Absolute link to page ##PageB## located in ##PageA## in wiki ##WikiA##|{{{[[WikiA:PageA.PageB]]}}}|[[PageB>>]]
|Link that opens in a new window|{{{[[PageA||target="_blank"]]}}}|[[PageA>>]]
|Implicit link to a URL|{{{This is a URL: http://xwiki.org}}}|This is a URL: http://xwiki.org
|Explicit link to a URL|{{{[[http://xwiki.org]]}}}|[[http://xwiki.org]]
|Explicit link to a URL with a label|{{{[[XWiki>>http://xwiki.org]]}}}|[[XWiki>>http://xwiki.org]]
|Link to an email address|{{{[[john@smith.net>>mailto:john@smith.net]]}}}|[[john@smith.net>>mailto:john@smith.net]]
|Link to an attachment on the current page|{{{[[attach:img.png]]}}}|[[img.png>>]]
|Link to an attachment in a different page|{{{[[attach:PageA.PageB@img.png]]}}}|[[img.png>>]]
|Link to an Anchor in a page|{{{[[PageA.PageB||anchor="anchor"]]}}}|[[PageB>>]]
|Link to a Heading in a page|(((
{{{[[PageA.PageB||anchor="HMyheading"]]}}}

{{info}}
When you add a Heading, an anchor named "H" followed by the heading title with only alpha characters is created. For example, for a Heading named "My heading", the generated anchor will be "HMyheading".
{{/info}}
)))|[[PageB>>]]
|Link to an anchor in the current page|{{{[[label>>||anchor="anchor"]]}}}|[[label>>]]
|Link to a page with a query string|{{{[[PageA.PageB||queryString="param1=value1&param2=value2"]]}}}|[[PageB>>]]
|Link to the current page with a query string|{{{[[label>>||queryString="param1=value1&param2=value2"]]}}}|[[label>>]]

{{velocity}}
$subHeading XWiki Syntax 2.1 Link Specification $subHeading
{{/velocity}}

{{info}}
The part in ##( )## is required, while the parts in ##[ ]## are optional.
{{/info}}

The full format of a link is **##[label>>] (resource) [||parameters]##**

* **##label##**: An optional string which will be displayed to the user as the link name when rendered. The label may contain XWiki Syntax. If no label is specified a default label will be generated. The generation pattern can be changed, see the [[Admin Guide>>http://www.xwiki.org/xwiki/bin/view/Documentation/AdminGuide/]]. Example: ##My Page##
* **##resource##**: A required string with the link reference in one of the following forms
** **URL**: Any URL in the form of **##[url:] (protocol:~/~/path)##**. Examples: ##http:~/~/xwiki.org##, ##url:https:~/~/svn.xwiki.org/##
*** **##url:##** An optional string identifying the resource as an URL.
** **Wiki page** {{info}}Since 10.6{{/info}} reference in the form ##(page: ) [wikiName:] (pageNameList)##**. Examples: ##page:Page##, ##page:myxwiki:Page##, ##page:ParentPage.ChildPage.SubChildPage##, ##page:../SiblingPage##, ##page:./ChildPage##**
*** **##page:##** A required string identifying the resource as an XWiki page. The same reference can be use for either a terminal or non-terminal page, both both exist it will lead to the non-terminal page.
*** **##wikiName##**: An optional string containing the name of a virtual wiki. The link will point to a page inside that virtual wiki. If no wiki is specified, the current wiki is used. Example: ##mywiki##
*** **##pageNameList##**: A required list of slash-separated wiki Pages names pointing to the final linked wiki Page syntax. It's also possible to us ##.## and ##..## to indicate current or parent page/wiki. Examples: ##Main##, ##A/B##, ##A/B/C##, ##../Sibling##, ##./Child##
** **Wiki document** reference in the form **##(doc: ) ~[~[wikiName:] spaceNameList.] (documentName)##**. Examples: ##doc:Welcome##, ##doc:Main.Welcome##, ##doc:mywiki:Main.Welcome##
*** **##doc:##** A required string identifying the resource as an XWiki terminal page. A non-terminal page can also be referenced this way, but it must append its ##.WebHome## part (e.g. ##doc:Sandbox.WebHome##).
*** **##wikiName##**: An optional string containing the name of a virtual wiki. The link will point to a page inside that virtual wiki. If no wiki is specified, the current wiki is used. Example: ##mywiki##.
*** **##spaceNameList##**: An optional dot-separated list of wiki Space names. If no space is specified the current space is used. Examples: ##Main##, ##A.B##, ##A.B.C##
*** **##documentName##**: A required string containing the name of the linked wiki page. Example: ##Welcome##
** **Wiki space** {{info}}Since 7.4.1{{/info}} reference in the form **##(space: ) [wikiName:] (spaceNameList)##**. Examples: ##space:Main##, ##space:mywiki:Main##, ##space:A.B.C##
*** **##space:##** A required string identifying the resource as an XWiki non-terminal page (i.e. a space).
*** **##wikiName##**: An optional string containing the name of a virtual wiki. The link will point to a page inside that virtual wiki. If no wiki is specified, the current wiki is used. Example: ##mywiki##
*** **##spaceNameList##**: A required list of dot-separated wiki Space names pointing to the final linked wiki Space (or non-terminal page). Examples: ##Main##, ##A.B##, ##A.B.C##
** **InterWiki page** reference in the form **##interwiki: (interWikiAlias: ) (pageName)##**. Example: ##interwiki:wikipedia:XWiki##
*** **##interwiki:##** A required string identifying the resource as an InterWiki link.
*** **##interWikiAlias##**: An optional [[Inter Wiki>>http://en.wikipedia.org/wiki/InterWiki]] alias as defined in the InterWiki Map (see the [[Admin Guide>>http://www.xwiki.org/xwiki/bin/view/Documentation/AdminGuide/]]). Example: ##wikipedia##
*** **##pageName##**: A required string containing the name of the linked page. Example: ##XWiki##
** **Attachment** reference in the form **##attach~: [wikiPageName@] (attachmentName)##**. Examples: ##attach~:img.png##, ##attach~:mywiki:Main.WebHome@img.png##, ##attach~:mywiki:Main@img.png##
*** **##attach~:##** A required string identifying the resource as attachment.
*** **##wikiPageName##**: An optional string referencing the (terminal or non-terminal) page that holds the attachment. This is resolved identically to "Untyped", below.
*** **##attachmentName##**: Name of the attachment as it is stored in the wiki. Example: ##photo.png##
** **Email address** in the form **##mailto~: (emailAddress)##** (###anchor## is not valid). Example: ##mailto~:john@smith.com##
*** **##mailto~:##** A required string identifying the resource as email.
*** **##emailAddress##**: Targeted email address. Example: ##john@smith.com##
** **Relative path** reference on the server in the form **##path: (relPath)##**. Example: ##path:$doc.getURL('reset')## produces target address ##http:~/~/server.domain.com/xwiki/bin/reset/Space/Page## where ##/xwiki/bin/reset/Space/Page## is produced by ##$doc.getURL('reset')##.
*** **##path:##** A required string identifying the resource as a relative path.
*** **##relPath##**: A required string containing the relative path of the resource on the server that shall be linked.
** **UNC (Windows Explorer)** reference in the form **##unc: (path)##**. The link is rendered as a ##file:~/~/## link. Examples: ##unc:C:\Windows\##, ##unc:~\~\myserver\path\img.png##, ##unc:home/user/somefile##
*** **##unc:##** A required string identifying the resource as a UNC (Windows Explorer) path.
*** **##path##**: A required string containing the local path of resource accessible by the user. Examples: ##C:\Windows\##, ##~\~\myserver\path\img.png##, ##home/user/somefile##
** **Untyped**: If none of the above mentioned resource types are specified (i.e. no ##type:## resource prefix was specified in the link), then the link will be treated as a link to an XWiki terminal or non-terminal page using the following algorithm:
*** **##Terminal page##** in the current space, //only// if it exists. Example: ##~[~[A]]## is resolved to the equivalent of ##~[~[doc:currentSpace.A]]##
*** **##Non-terminal page##** {{info}}Since 7.4.1{{/info}} in the current space. Example: ##~[~[A]]## is resolved to the equivalent of ##~[~[space:currentSpace.A]]##, which is the equivalent of ##~[~[doc:currentSpace.A.WebHome]]##
*** If the current page is non-terminal and the previous 2 checks above did not find an existing page, 2 additional checks are made:
**** **##Terminal page##** {{info}}Since 7.4.1{{/info}} as sibling in the parent space, //only// if it exists. Example: The ##~[~[B]]## link inside the non-terminal page ##A.C## is resolved to the equivalent of ##~[~[doc:A.B]]##
**** **##Non-terminal page##** {{info}}Since 7.4.1{{/info}} as sibling in the parent space, regardless if it exists or not. Example: The ##~[~[B]]## link inside the non-terminal page ##A.C## is resolved to the equivalent of ##~[~[space:A.B]]##, which is the equivalent of ##~[~[doc:A.B.WebHome]]##
*** //Note1 - Absolute links//: {{info}}Since 7.4.1{{/info}} If the untyped link has 2 or more dot-separated components specified (i.e. that look like a space name and a page name), the above algorithm will resolve the page relative to the current wiki, and not the current space. Example: ##~[~[A.B]]## can be resolved to either ##~[~[doc:currentWiki:A.B]]## (if it exists) or to ##~[~[space:currentWiki:A.B]##] (equivalent of ##~[~[doc:currentWiki:A.B.WebHome]]##) and not to ##~[~[doc:currentWiki:currentSpace.A.B]]## or ##~[~[doc:currentWiki:currentSpace.A.B.WebHome]]##.
*** //Note2 - Special handling of ##.WebHome##//: {{info}}Since 7.4.1{{/info}} If the untyped link ends in ##.WebHome##, it will //always// be handled as a terminal page. Example: ##~[~[A.WebHome]]## will always be resolved to the equivalent of ##~[~[doc:A.WebHome]]## and not to ##~[~[doc:A.WebHome.WebHome]]##.
* **##parameters##**: An optional list of space-separated parameters passed to the link. Example: ##queryString="mydata1=5&mydata2=Hello" anchor="HTableOfContents" target="_blank"##
** **##queryString##**: An optional query string for specifying parameters that will be appended to the link target address and used in the rendered URL. Example: ##url:http:~/~/domain.com/path||queryString="mydata1=5&mydata2=Hello"## produces target address ##http:~/~/domain.com/path?mydata1=5&mydata2=Hello##
** **##anchor##**: An optional anchor name pointing to an anchor defined in the referenced link. Note that in XWiki anchors are automatically created for headings. Example: ##url:http:~/~/domain.com/path||anchor="HTableOfContents"## produces target address ##http:~/~/domain.com/path#HTableOfContents##
** **##target##**: An optional parameter that allows to open link target in new window. Example: ##target="_blank"##
`
Deno.bench({
    name:"xwiki parser performance",
    fn(){
        doc(fulldoc)
    }
})

