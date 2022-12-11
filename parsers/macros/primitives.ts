import { contextValue, emptyContext, parserfunc, parservar } from "./types.ts";
import { value } from "./utility.ts";

export function eq<T extends contextValue = emptyContext>(
    expectedraw: parservar<string, T>,
): parserfunc<T> {
    return (str, subtree, context) => {
        const expected: string = value(expectedraw, subtree, context);
        if (
            str.length > 0 && expected.length > 0 && str.indexOf(expected) == 0
        ) {
            return [true, str.slice(expected.length)];
        } else {
            return [false, str];
        }
    };
}

export function neq<T extends contextValue = emptyContext>(
    expectedraw: parservar<string, T>,
): parserfunc<T> {
    return (str, subtree, context) => {
        const expected: string = value(expectedraw, subtree, context);
        if (str.length > 0 && str.indexOf(expected) == 0) {
            return [false, str];
        } else {
            return [true, str.slice(1)];
        }
    };
}

export function match<T extends contextValue = emptyContext>(
    patternraw: parservar<RegExp, T>,
): parserfunc<T> {
    return (str, subtree, context) => {
        const pattern = value(patternraw, subtree, context);
        const res = str.match(pattern);
        if (str.length > 0 && res?.index === 0) {
            return [true, str.slice(res[0].length)];
        } else {
            return [false, str];
        }
    };
}

export const empty: parserfunc = function (str, _context) {
    if (str.length == 0) {
        return [true, ""];
    } else {
        return [false, str];
    }
};
