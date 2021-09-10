import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { eq, match, multiple, or, seq, symbol, treeNode } from "./macros.ts";

Deno.test({
  name: "eq() test",
  fn(): void {
    assertEquals(eq("=")("", new treeNode("root")), [false, ""]);
    assertEquals(eq("=")("=====", new treeNode("root")), [
      true,
      "====",
    ]);
    assertEquals(eq("===")("=====", new treeNode("root")), [true, "=="]);
  },
});

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
  },
});

Deno.test({
  name: "match() test",
  fn(): void {
    assertEquals(match(/[0-9]/)("0", new treeNode("root")), [
      true,
      "",
    ]);
    assertEquals(match(/[0-9]/)("a", new treeNode("root")), [
      false,
      "a",
    ]);
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
