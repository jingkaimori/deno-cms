import { assertObjectMatch } from "../deps.ts";
import { parser } from "./macros/macros.ts";
import * as local from "./markdown.ts";
import * as borrow from "./borrowed/markdown.ts"

Deno.test({
    name: "title() test",
    fn(): void {
        testpara(local.doc);
    }
});

Deno.test({
    name: "borrowed title() test",
    fn(): void {
        testpara(borrow.doc);
    }
});

Deno.test({
    name: "borrowed test",
    fn(): void {
        const res=borrow.doc("\
# Title\n\
\n\
paragraph 1\n\
\n\
paragraph [2](https://link.com/path/to/page) long Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum \n\
")
        console.log(res.tree)
    }
});

const testpara = (fun:parser)=>{
    const res=fun("\
# Title\n\
\n\
paragraph 1\n\
\n\
paragraph 2 long Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum \n\
")
    assertObjectMatch(res,{
        success:true
    });
    assertObjectMatch(res.tree.toPlainObject(),{
        childs:[
            {
                name:"title",
                childs:[
                    {
                        name:"text",
                        raw:"Title"
                    }
                ]
            },
            {
                name:"paragraph"
            },
            {
                name:"paragraph"
            }
        ]
    })
}