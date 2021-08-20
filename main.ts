import { treeNode } from "./macros.ts";
import { doc } from "./mediawiki.ts";

let ALT2 = new treeNode("root");
let res = doc(
  `=== T1 ===
A simple text

A complicated text.A complicated text.A complicated text.A complicated text.A 
complicated text.A complicated text.A complicated text.A complicated text.A 
complicated text.

see also [[link>>target]]

* List 1
* List 1
* List 1
* List 1

* List 1
** List 1
*** List 1
** List 1 [[ref>>cite 1]]
* List 1

=== T2 ===`,
  ALT2,
);
console.log(ALT2.toString());
let a = {};
