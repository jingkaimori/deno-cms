import {
    empty,
    eq,
    match,
    multiple,
    neq,
    not,
    or,
    parserfunc,
    parservar,
    seq,
    symbol,
    treeNode,
    getparser,
  value,
  } from "../macros/macros.ts";

/** 不换行的文本 */
const text = multiple(not(or(eq("\n"),empty)),1)

const title = seq(
    multiple(eq("#"),1,7),
    symbol(text,"title"),
    eq("\n")
)

const paragraph = seq(
    symbol(text,"paragraph"),
    eq("\n")
)

const blankline = multiple(eq("\n"),1)

export const doc = getparser(multiple(or(
    title,
    blankline,
    paragraph,
)));