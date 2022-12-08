import {
    empty,
    eq,
    multiple,
    not,
    or,
    seq,
    symbol,
    getparser,
  } from "./macros/macros.ts";

/** 不换行的文本 */
const text = symbol(
    multiple(not(or(eq("\n"),empty)),1)
    ,"text"
)

const title = seq(
    multiple(eq("#"),1,7),
    eq(' '),
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