import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { doc, newline, title, titletext } from "./mediawiki.ts";
import { treeNode } from "./macros.ts";

Deno.test({
  name: "title() test",
  fn(): void {
    let ALT1 = new treeNode("root");
    let res = title("=== title ===", ALT1);
    assertEquals(res, [true, ""]);
    assertEquals(title("=== title ==", new treeNode("root")), [
      false,
      "=== title ==",
    ]);
  },
});
Deno.test({
  name: "titletext() test",
  fn(): void {
    assertEquals(titletext(" title ", new treeNode("root")), [
      true,
      "",
    ]);
    assertEquals(titletext(" title =", new treeNode("root")), [
      true,
      "=",
    ]);
    assertEquals(titletext("= title ", new treeNode("root")), [
      false,
      "= title ",
    ]);
  },
});

Deno.test({
  name: "newline() test",
  fn(): void {
    let ALT1 = new treeNode("root");
    let res = newline("=== title ==", ALT1);

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
    let ALT2 = new treeNode("root");
    let res = doc(
      `=== title ===
  === title ==`,
      ALT2,
    );
    assertEquals(ALT2, {
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
        "raw": "  === title ==",
        "childs": [{ "name": "plain", "raw": "  === title ==", "childs": [] }],
      }],
    });
    assertEquals(res, [true, ""]);
  },
});
