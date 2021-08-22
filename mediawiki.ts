import { eq, match, multiple, or, parserfunc, seq, symbol } from "./macros.ts";

let plainchar: parserfunc = match(/[^\n\r]/);
let plain: parserfunc = symbol(
  multiple(plainchar),
  "__plain",
);

let whitespace: parserfunc = multiple(match(/[\t ]/), 1);

let linebreak: parserfunc = multiple(match(/[\n\r]/), 1)

export let title: parserfunc = symbol(function __title(str, context) {
  return (seq(
    eq("="),
    or(__title, titletext),
    eq("="),
  ))(str, context);
}, "title");

export let titletext: parserfunc = symbol(
  particleinmiddle(
    multiple(match(/[^\n\r=]/), 1),
    eq("="),
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
      2,
    ),
    eq("]]"),
  ),
  "hyperlink",
);

export let linkfreechar: parserfunc = match(/[^\n\r\[]/);

export let inline: parserfunc = symbol(
  multiple(
    or(
      hyperlink,
      symbol(seq(multiple(eq("[")), multiple(linkfreechar, 1)), "__plain"),
    ),1
  ),
  "text",
);

export let listitem: parserfunc = symbol(
  seq(multiple(match(/[*#;:]/), 1), inline),
  "__listitem",
);

let titleline = seq(title, linebreak);

/**
 * match mode like `A(BA)*`
 * @param beginend
 * @param middle
 * @returns
 */
function particleinmiddle(
  beginend: parserfunc,
  middle: parserfunc,
): parserfunc {
  return seq(beginend, multiple(seq(middle, beginend)));
}

let paragraph = symbol(
  or(
    particleinmiddle(listitem, match(/[\n\r]/)),
    particleinmiddle(inline, match(/[\n\r]/)),
  ),
  "par",
);

let newline: parserfunc = or(title, paragraph);

export let doc: parserfunc = particleinmiddle(
  newline,
  linebreak,
);
