import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { hyperlink, list, listitemnew, macrowithoutbody, postprocess, title, titletext } from "./xwiki.ts";
import { match, seq, treeNode } from "../macros/macros.ts";

Deno.test({
  name: "title() test",
  fn(): void {
    let ALT1 = new treeNode("root");
    let res = title("=== title ===", ALT1,[]);
    assertEquals(res, [true, ""]);
    assertEquals(title("=== title ==", new treeNode("root"),[]), [
      false,
      "=== title ==",
    ]);
  },
});
Deno.test({
  name: "titletext() test",
  fn(): void {
    assertEquals(titletext(" title ", new treeNode("root"),[]), [
      true,
      "",
    ]);
    assertEquals(titletext(" title =", new treeNode("root"),[]), [
      true,
      "=",
    ]);
    assertEquals(titletext("= title ", new treeNode("root"),[]), [
      false,
      "= title ",
    ]);
  },
});

Deno.test({
  name: "hyperlink() test",
  fn(): void {
    assertEquals(hyperlink("[[ title >> url]]", new treeNode("root"),[]), [
      true,
      "",
    ]);
  },
});


Deno.test({
  name: "list() test",
  fn(): void {
    let ALT1 = new treeNode("root")
    seq(match(/[\n\r]/), list)("\n** ca",ALT1,[])
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
      ALT1,[]), [
      true,
      "\n",
    ]);
    postprocess(ALT1)
    console.log(ALT1.toString(4))
  },
});
Deno.test({
  name: "ordered list() test",
  fn(): void {
    let ALT1 = new treeNode("root")
    assertEquals(list(
      "\
1. 设置领地：\n\
11. 先用一块木头斧子左键敲击一方块设置点A，右键敲击一方块设置点B（可以输入{{code}}/res select size{{/code}}查看所选区域的大小）；\n\
11. 之后输入{{code}}/res create 123{{/code}}（例）\n\
11. 这样设置后，就形成了[以AB连线为体对角线的长方体的][名为123的]领地（包括A、B所在边），设置领地需要金钱\n",
      ALT1,[]), [
      true,
      "\n",
    ]);
    postprocess(ALT1)
    console.log(ALT1.toString(4))
  },
});
Deno.test({
  name: "macro() test",
  fn(): void {
    let ALT1 =new treeNode("root")
    console.log("{{toc/}}")
    assertEquals(macrowithoutbody(
      "{{toc/}}",
      ALT1,[]), [
      true,
      "",
    ]);
    postprocess(ALT1)
    console.log(ALT1.toString(4))
  },
});