import { assertObjectMatch } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { empty, eq,match } from "./primitives.ts";
import { getparser } from "./utility.ts";

Deno.test({
    name: "match() test",
    fn(): void {
      let regexpparser = getparser(match(/[0-9]/))
      assertObjectMatch(
        regexpparser("0"),
        {success:true,leftstr:""},
      );
      assertObjectMatch(
        regexpparser("a"),
        {success:false,leftstr:"a"},
      );
    },
  });

  
Deno.test({
    name: "eq() test",
    fn(): void {
      let equalsingle = getparser(eq("="));
      let equalmultiple = getparser(eq("==="));
      assertObjectMatch(
        equalsingle("a"),
        {success:false,leftstr:"a"},
      );
      assertObjectMatch(
        equalsingle("====="),
        {success:true,leftstr:"===="},
      );
      assertObjectMatch(
        equalmultiple("====="),
        {success:true,leftstr:"=="},
      );
    },
  });
  Deno.test({
    name: "eq() with empty string \"\" test",
    fn(): void {
      let equalsingle = getparser(eq(""));
      assertObjectMatch(
        equalsingle(""),
        {success:false,leftstr:""},
      );
      assertObjectMatch(
        equalsingle("====="),
        {success:false,leftstr:"====="},
      );
    },
  });
  
Deno.test({
  name: "empty() test",
  fn(): void {
    let emptyf = getparser(empty)
    assertObjectMatch(
      emptyf("====="),
      {success:false,leftstr:"====="},
    );
    assertObjectMatch(
      emptyf(""),
      {success:true,leftstr:""},
    );
  },
});