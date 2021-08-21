import { eq, match, multiple, or, parserfunc, seq, symbol } from "./macros.ts";

let plainchar: parserfunc = match(/[^\n\r]/);
let plain: parserfunc = symbol(
  multiple(plainchar),
  "__plain",
);

let whitespace: parserfunc = multiple(match(/[\t ]/), 1);

let linebreak: parserfunc = or(
  symbol(multiple(match(/[\n\r]/), 2), "multiple linebreak"),
  match(/[\n\r]/),
);

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

let path: parserfunc = symbol(
  multiple(match(/[^\n\r\]>]/)),
  "__path",
);

let label: parserfunc = symbol(
  multiple(match(/[^\n\r\]>]/)),
  "__label",
);

export let hyperlink: parserfunc = symbol(
  seq(
    eq("[["),
    label,
    multiple(
      seq(
        eq(">>"),
        path,
      ),
      0,
      2
    ),eq("]]")
  ),
  "hyperlink",
);

let linkfreechar: parserfunc = match(/[^\n\r\[]/);

let inline: parserfunc = symbol(multiple(
  or(hyperlink, symbol(seq(multiple(eq("[")), multiple(linkfreechar,1)), "__plain")),
),"text");

export let listitem: parserfunc = symbol(
  seq(multiple(match(/[*#;:]/), 1), inline),
  "__listitem",
);

let newline: parserfunc = or(title, listitem, inline);

export let doc: parserfunc = seq(
  newline,
  multiple(
    seq(linebreak, newline),
  ),
);
