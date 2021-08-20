import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import * as parser from "./parser.ts";




Deno.test({
    name: "eq() test",
    fn(): void {
      assertEquals(parser.eq("=")(""), [false,""]);
      assertEquals(parser.eq("=")("====="), [ true, "====" ]);
    },
  });

Deno.test({
    name: "multiple() test",
    fn(): void {
      assertEquals(parser.multiple(parser.eq("="))(""), [ true, "" ]);
      assertEquals(parser.multiple(parser.eq("="))("====="), [ true, "" ]);
      assertEquals(parser.multiple(parser.eq("="),6)("====="), [ false, "" ]);
      assertEquals(parser.multiple(parser.eq("="),0,4)("====="), [ false, "" ]);
    },
  });

Deno.test({
    name: "seq() test",
    fn(): void {
        let parserfunction = parser.seq(parser.eq("="),parser.multiple(parser.eq("a")),parser.eq("="))
        assertEquals(parserfunction("=a="),[ true, "" ]);
        assertEquals(parserfunction("=aba="),[ false, "ba=" ]);
        assertEquals(parserfunction("=="),[ true, "" ]);
        assertEquals(parserfunction("==="),[ true, "=" ]);
    },
  });

Deno.test({
      name: "doc() test",
      fn(): void {
        assertEquals(parser.doc("=== title ==="),[ true, "" ]);
        assertEquals(parser.doc("=== title =="),[ true, "" ]);
      },
    });