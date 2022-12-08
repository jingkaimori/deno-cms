import { multiple, seq } from "./operators.ts";
import { parserfunc } from "./types.ts";

/**
 * match mode like `A(BA)*`
 * @param beginend subpattern `A`
 * @param middle subpattern `B`
 * @returns
 */
export function particleinmiddle(
    beginend: parserfunc,
    middle: parserfunc,
): parserfunc {
    return seq(beginend, multiple(seq(middle, beginend)));
}