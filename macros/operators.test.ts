import { assertThrows,assertObjectMatch } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { multiple, not, or, seq, symbol } from "./operators.ts";
import { empty, eq } from "./primitives.ts";
import { getparser } from "./utility.ts"


Deno.test({
  name: "multiple() test",
  fn(): void {
    let infinitemultiple = getparser(multiple(eq("=")))
    assertObjectMatch(
      infinitemultiple(""),
      {success:true,leftstr:""},
    );
    assertObjectMatch(
      infinitemultiple("====="),
      {success:true,leftstr:""},
    );
    assertObjectMatch(
      infinitemultiple("=====+"),
      {success:true,leftstr:"+"},
    );
    assertObjectMatch(
      getparser(multiple(eq("="), 1))(
        "+=====+"
      ),
      {success:false,leftstr:"+=====+"},
    );
    assertObjectMatch(
      getparser(multiple(eq("="), 6))("====="),
      {success:false,leftstr:"====="},
    );
    assertObjectMatch(
      getparser(multiple(eq("="), 0, 4))(
        "====="
      ),
      {success:false,leftstr:"====="},
    );
    assertObjectMatch(
      getparser(multiple(eq("="), 1, 1))(
        "="
      ),
      {success:false,leftstr:"="},
    );

    assertThrows(()=>getparser(multiple(empty))(
      "",
    ),Error,"empty match")
  },
});

Deno.test({
  name: "or() test",
  fn(): void {
    let equfront = getparser(or(eq("="), eq("|")));
    let splitfront = getparser(or(eq("|"), eq("=")));
    assertObjectMatch(
      equfront(
        "|"
      ),
      {success:true,leftstr:""},
    );
    assertObjectMatch(
      splitfront(
        "|"
      ),
      {success:true,leftstr:""},
    );

    assertObjectMatch(
      equfront(
        "+"
      ),
      {success:false,leftstr:"+"},
    );
    assertObjectMatch(
      splitfront(
        "+"
      ),
      {success:false,leftstr:"+"},
    );

    assertObjectMatch(
      equfront(
        "|=|||"
      ),
      {success:true,leftstr:"=|||"},
    );
    assertObjectMatch(
      splitfront(
        "|=|||"
      ),
      {success:true,leftstr:"=|||"},
    );
    assertObjectMatch(
      getparser(or(eq("||||"), eq("=||")))(
        "|||"
      ),
      {success:false,leftstr:"|||"},
    );
  },
});

Deno.test({
  name: "not() test",
  fn(): void {
    assertObjectMatch(
      getparser(not(eq("=")))(
        "|"
      ),
      {success:true,leftstr:""},
    );
    assertObjectMatch(
      getparser(not(eq("|")))(
        "|"
      ),
      {success:false,leftstr:"|"},
    );
    assertObjectMatch(
      getparser(not(eq("|")))(
        ""
      ),
      {success:true,leftstr:""},
    );

    assertObjectMatch(
      getparser(not(or(eq("="), eq("|"))))(
        "+"
      ),
      {success:true,leftstr:""},
    );
    assertObjectMatch(
      getparser(not(or(eq("|"), eq("="))))(
        "|"
      ),
      {success:false,leftstr:"|"},
    );
    assertObjectMatch(
      getparser(not(eq("||||")))(
        "|||"
      ),
      {success:true,leftstr:"||"},
    );
  },
});

Deno.test({
  name: "seq() test",
  fn(): void {
    let parser = getparser(seq(
      eq("="),
      multiple(eq("a")),
      eq("="),
    ));
    assertObjectMatch(parser("=a="), {
      success:true,
      leftstr:""
    });
    assertObjectMatch(parser("=aba="), {
      success:false,
      leftstr:"=aba=",
    });
    assertObjectMatch(parser("=="),  {success:true,leftstr:""});
    assertObjectMatch(parser("==="), {success:true,leftstr:"="});
    assertObjectMatch(parser("=a==a="),{success:true,leftstr:"=a="});

    assertObjectMatch(getparser(seq(
      multiple(eq("a")),
    ))("aa="),{
      success:true,
      leftstr:"="
    })
    assertObjectMatch(getparser(seq(
      multiple(eq("")),
    ))(""), {
      success:true,
      leftstr:""
    })
  },
});

Deno.test({
  name: "symbol() test 1",
  fn(): void {
    let parser = getparser(seq(
      eq("="),
      symbol(multiple(eq("abcd")), "title"),
      eq("="),
    ));
    assertObjectMatch(parser("=abcd="), {
      success:true,
      leftstr:"",
      tree:{
        childs:{
          "0":{
            raw:"abcd",
            name:"title"
          }
        }
      }
    });
  },
});

Deno.test({
  name: "symbol() test 2",
  fn(): void {
    let parserfunction = getparser(seq(
      eq("="),
      symbol(seq(eq("ab"), eq("cd")), "title"),
      eq("="),
    ));
    assertObjectMatch(parserfunction("=abcd="), {
      success:true,
      leftstr:"",
      tree:{
        childs:{
          "0":{
            raw:"abcd",
            name:"title"
          }
        }
      }
    });
  },
});
