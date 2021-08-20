import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { doc, title, titletext } from "./mediawiki.ts";
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
  name: "hyperlink() test",
  fn(): void {
    assertEquals(titletext("[[ title >> url]]", new treeNode("root")), [
      true,
      "",
    ]);
  },
});
