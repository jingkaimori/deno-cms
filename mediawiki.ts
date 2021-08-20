
import { eq, match, multiple, or, parserfunc, seq, symbol } from "./macros.ts";

let plainchar: parserfunc = match(/[^\n\r]/);
let plain: parserfunc = symbol(
  multiple(plainchar),
  "plain",
);

let whitespace: parserfunc = multiple(match(/[\t ]/), 1);

let linebreak: parserfunc = multiple(match(/[\n\r]/), 1);

export let title: parserfunc = symbol(function __title(str, context) {
  return (seq(
    eq("="),
    or(__title, titletext),
    eq("="),
  ))(str, context);
}, "title");

export let titletext: parserfunc = symbol(
  seq(
    multiple(match(/[^\n\r=]/), 1),
    multiple(seq(
      eq("="),
      multiple(match(/[^\n\r=]/), 1),
    )),
  ),
  "titletext",
);

export let newline: parserfunc = symbol(
  or(title, plain),
  "line",
);

export let doc: parserfunc = seq(
  newline,
  multiple(
    seq(linebreak, newline),
  ),
);

