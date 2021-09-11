import { parserfunc } from "./types.ts";

export function warnemptymatch(func: parserfunc): parserfunc {
  return (str, context) => {
    const [receive, newstr] = func(str, context);
    if (newstr.length > 0 && str.indexOf(newstr) > 0) {
      console.warn("");
    }
    return [receive, newstr];
  };
}
