import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import * as parser from "./parser.ts";

Deno.test({
  name: "eq() test",
  fn(): void {
    assertEquals(parser.eq("=")("", new parser.treeNode("root")), [false, ""]);
    assertEquals(parser.eq("=")("=====", new parser.treeNode("root")), [
      true,
      "====",
    ]);
  },
});

Deno.test({
  name: "multiple() test",
  fn(): void {
    assertEquals(
      parser.multiple(parser.eq("="))("", new parser.treeNode("root")),
      [true, ""],
    );
    assertEquals(
      parser.multiple(parser.eq("="))("=====", new parser.treeNode("root")),
      [true, ""],
    );
    assertEquals(
      parser.multiple(parser.eq("="))("=====+", new parser.treeNode("root")),
      [true, "+"],
    );
    assertEquals(
      parser.multiple(parser.eq("="), 1)(
        "+=====+",
        new parser.treeNode("root"),
      ),
      [false, "+=====+"],
    );
    assertEquals(
      parser.multiple(parser.eq("="), 6)("=====", new parser.treeNode("root")),
      [false, ""],
    );
    assertEquals(
      parser.multiple(parser.eq("="), 0, 4)(
        "=====",
        new parser.treeNode("root"),
      ),
      [false, ""],
    );
  },
});

Deno.test({
  name: "or() test",
  fn(): void {
    assertEquals(
      parser.or(parser.eq("="), parser.eq("|"))(
        "|",
        new parser.treeNode("root"),
      ),
      [true, ""],
    );
    assertEquals(
      parser.or(parser.eq("|"), parser.eq("="))(
        "|",
        new parser.treeNode("root"),
      ),
      [true, ""],
    );

    assertEquals(
      parser.or(parser.eq("="), parser.eq("|"))(
        "+",
        new parser.treeNode("root"),
      ),
      [false, "+"],
    );
    assertEquals(
      parser.or(parser.eq("|"), parser.eq("="))(
        "+",
        new parser.treeNode("root"),
      ),
      [false, "+"],
    );

    assertEquals(
      parser.or(parser.eq("="), parser.eq("|"))(
        "|=|||",
        new parser.treeNode("root"),
      ),
      [true, "=|||"],
    );
    assertEquals(
      parser.or(parser.eq("|"), parser.eq("="))(
        "|=|||",
        new parser.treeNode("root"),
      ),
      [true, "=|||"],
    );
  },
});

Deno.test({
  name: "match() test",
  fn(): void {
    assertEquals(parser.match(/[0-9]/)("0", new parser.treeNode("root")), [
      true,
      "",
    ]);
    assertEquals(parser.match(/[0-9]/)("a", new parser.treeNode("root")), [
      false,
      "a",
    ]);
  },
});

Deno.test({
  name: "seq() test",
  fn(): void {
    let parserfunction = parser.seq(
      parser.eq("="),
      parser.multiple(parser.eq("a")),
      parser.eq("="),
    );
    assertEquals(parserfunction("=a=", new parser.treeNode("root")), [
      true,
      "",
    ]);
    assertEquals(parserfunction("=aba=", new parser.treeNode("root")), [
      false,
      "=aba=",
    ]);
    assertEquals(parserfunction("==", new parser.treeNode("root")), [true, ""]);
    assertEquals(parserfunction("===", new parser.treeNode("root")), [
      true,
      "=",
    ]);
  },
});

Deno.test({
  name: "symbol() test 1",
  fn(): void {
    let parserfunction = parser.seq(
      parser.eq("="),
      parser.symbol(parser.multiple(parser.eq("abcd")), "title"),
      parser.eq("="),
    );
    let ALT = new parser.treeNode("root");
    assertEquals(parserfunction("=abcd=", ALT), [true, ""]);
    assertEquals(ALT.childs[0].raw, "abcd");
    assertEquals(ALT.childs[0].name, "title");
  },
});

Deno.test({
  name: "symbol() test 2",
  fn(): void {
    let parserfunction = parser.seq(
      parser.eq("="),
      parser.symbol(parser.seq(parser.eq("ab"), parser.eq("cd")), "title"),
      parser.eq("="),
    );
    let ALT = new parser.treeNode("root");
    assertEquals(parserfunction("=abcd=", ALT), [true, ""]);
    assertEquals(ALT.childs[0].raw, "abcd");
    assertEquals(ALT.childs[0].name, "title");
  },
});
Deno.test({
  name: "title() test",
  fn(): void {
    let ALT1 = new parser.treeNode("root");
    let res = parser.title("=== title ===", ALT1);
    assertEquals(res, [true, ""]);
    assertEquals(parser.title("=== title ==", new parser.treeNode("root")), [
      false,
      "=== title ==",
    ]);
  },
});
Deno.test({
  name: "titletext() test",
  fn(): void {
    assertEquals(parser.titletext(" title ", new parser.treeNode("root")), [
      true,
      "",
    ]);
    assertEquals(parser.titletext(" title =", new parser.treeNode("root")), [
      true,
      "=",
    ]);
    assertEquals(parser.titletext("= title ", new parser.treeNode("root")), [
      false,
      "= title ",
    ]);
  },
});

Deno.test({
  name: "newline() test",
  fn(): void {
    let ALT1 = new parser.treeNode("root");
    let res = parser.newline("=== title ==", ALT1);

    assertEquals(ALT1, {
      "name": "root",
      "raw": "",
      "childs": [{
        "name": "line",
        "raw": "=== title ==",
        "childs": [{ "name": "plain", "raw": "=== title ==", "childs": [] }],
      }],
    });
    assertEquals(res, [true, ""]);
  },
});

Deno.test({
  name: "doc() test",
  fn(): void {
    let ALT2 = new parser.treeNode("root");
    let res = parser.doc(
      `=== title ===
=== title ==`,
      ALT2,
    );
    console.log(ALT2.toString(), {
      "name": "root",
      "raw": "",
      "childs": [{
        "name": "line",
        "raw": "=== title ===",
        "childs": [{
          "name": "title",
          "raw": "=== title ===",
          "childs": [{ "name": "titletext", "raw": " title ", "childs": [] }],
        }],
      }, {
        "name": "line",
        "raw": "=== title ==",
        "childs": [{ "name": "plain", "raw": "=== title ==", "childs": [] }],
      }],
    });
    assertEquals(res, [true, ""]);
  },
});
