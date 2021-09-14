import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { multiple, not, or, seq, symbol } from "./operators.ts";
import { eq } from "./primitives.ts";
import { treeNode } from "./types.ts"


Deno.test({
  name: "multiple() test",
  fn(): void {
    assertEquals(
      multiple(eq("="))("", new treeNode("root")),
      [true, ""],
    );
    assertEquals(
      multiple(eq("="))("=====", new treeNode("root")),
      [true, ""],
    );
    assertEquals(
      multiple(eq("="))("=====+", new treeNode("root")),
      [true, "+"],
    );
    assertEquals(
      multiple(eq("="), 1)(
        "+=====+",
        new treeNode("root"),
      ),
      [false, "+=====+"],
    );
    assertEquals(
      multiple(eq("="), 6)("=====", new treeNode("root")),
      [false, ""],
    );
    assertEquals(
      multiple(eq("="), 0, 4)(
        "=====",
        new treeNode("root"),
      ),
      [false, ""],
    );
    assertEquals(
      multiple(eq("="), 1, 1)(
        "=",
        new treeNode("root"),
      ),
      [false, ""],
    );
  },
});

Deno.test({
  name: "or() test",
  fn(): void {
    assertEquals(
      or(eq("="), eq("|"))(
        "|",
        new treeNode("root"),
      ),
      [true, ""],
    );
    assertEquals(
      or(eq("|"), eq("="))(
        "|",
        new treeNode("root"),
      ),
      [true, ""],
    );

    assertEquals(
      or(eq("="), eq("|"))(
        "+",
        new treeNode("root"),
      ),
      [false, "+"],
    );
    assertEquals(
      or(eq("|"), eq("="))(
        "+",
        new treeNode("root"),
      ),
      [false, "+"],
    );

    assertEquals(
      or(eq("="), eq("|"))(
        "|=|||",
        new treeNode("root"),
      ),
      [true, "=|||"],
    );
    assertEquals(
      or(eq("|"), eq("="))(
        "|=|||",
        new treeNode("root"),
      ),
      [true, "=|||"],
    );
    assertEquals(
      or(eq("||||"), eq("=||"))(
        "|||",
        new treeNode("root"),
      ),
      [false, "|||"],
    );
  },
});

Deno.test({
  name: "not() test",
  fn(): void {
    assertEquals(
      not(eq("="))(
        "|",
        new treeNode("root"),
      ),
      [true, ""],
    );
    assertEquals(
      not(eq("|"))(
        "|",
        new treeNode("root"),
      ),
      [false, "|"],
    );
    assertEquals(
      not(eq("|"))(
        "",
        new treeNode("root"),
      ),
      [true, ""],
    );

    assertEquals(
      not(or(eq("="), eq("|")))(
        "+",
        new treeNode("root"),
      ),
      [true, ""],
    );
    assertEquals(
      not(or(eq("|"), eq("=")))(
        "|",
        new treeNode("root"),
      ),
      [false, "|"],
    );
    assertEquals(
      not(eq("||||"))(
        "|||",
        new treeNode("root"),
      ),
      [true, "||"],
    );
  },
});

Deno.test({
  name: "seq() test",
  fn(): void {
    let parserfunction = seq(
      eq("="),
      multiple(eq("a")),
      eq("="),
    );
    assertEquals(parserfunction("=a=", new treeNode("root")), [
      true,
      "",
    ]);
    assertEquals(parserfunction("=aba=", new treeNode("root")), [
      false,
      "=aba=",
    ]);
    assertEquals(parserfunction("==", new treeNode("root")), [true, ""]);
    assertEquals(parserfunction("===", new treeNode("root")), [
      true,
      "=",
    ]);
    assertEquals(parserfunction("=a==a=",new treeNode("root")), [
      true,
      "=a=",
    ]);

    assertEquals(seq(
      multiple(eq("a")),
    )("aa=",new treeNode("root")), [
      true,
      "=",
    ])
    assertEquals(seq(
      multiple(eq("")),
    )("",new treeNode("root")), [
      true,
      "",
    ])
  },
});

Deno.test({
  name: "symbol() test 1",
  fn(): void {
    let parserfunction = seq(
      eq("="),
      symbol(multiple(eq("abcd")), "title"),
      eq("="),
    );
    let ALT = new treeNode("root");
    assertEquals(parserfunction("=abcd=", ALT), [true, ""]);
    assertEquals(ALT.childs[0].raw, "abcd");
    assertEquals(ALT.childs[0].name, "title");
  },
});

Deno.test({
  name: "symbol() test 2",
  fn(): void {
    let parserfunction = seq(
      eq("="),
      symbol(seq(eq("ab"), eq("cd")), "title"),
      eq("="),
    );
    let ALT = new treeNode("root");
    assertEquals(parserfunction("=abcd=", ALT), [true, ""]);
    assertEquals(ALT.childs[0].raw, "abcd");
    assertEquals(ALT.childs[0].name, "title");
  },
});
