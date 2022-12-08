import { particleinmiddle } from "./macros/commonpattern.ts";
import { charClasses, inClass, multiple, seq } from "./macros/macros.ts";


export const url = seq()

const lowercaseseq = multiple(inClass(charClasses.latinAlphabetLowercase))

const protocol = lowercaseseq

const domain = particleinmiddle