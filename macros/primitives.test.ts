import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { eq,match } from "./primitives.ts";
import { treeNode } from "./types.ts"


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