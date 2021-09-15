import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { hyperlink, list, listitemnew, title, titletext } from "./xwiki.ts";
import { treeNode } from "../macros/types.ts";
import { match, seq } from "../macros/macros.ts";

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
    assertEquals(hyperlink("[[ title >> url]]", new treeNode("root")), [
      true,
      "",
    ]);
  },
});


Deno.test({
  name: "list() test",
  fn(): void {
    let ALT1 = new treeNode("root")
    seq(match(/[\n\r]/), list)("\n** ca",ALT1)
    console.log(ALT1.toString())
    ALT1 = new treeNode("root")
    assertEquals(list(
      "\
* c\n\
* e\n\
** ca\n\
** cb\n\
*** cca\n\
* c\n\
* c\n",
      ALT1), [
      true,
      "\n",
    ]);
    console.log(ALT1.toString())
  },
});
