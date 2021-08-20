type result = [boolean, string];
type parserfunc = (str: string) => result;

let plainchar: parserfunc =
  match(/[^\n\r]/);
let plain: parserfunc =
  multiple(plainchar);

let whitespace: parserfunc = 
  multiple(match(/\s/),1);

let linebreak: parserfunc =
  multiple(match(/[\n\r]/),1)

let title: parserfunc = function __title(str: string) {
  return (seq(
    eq("="),
    or(__title, titletext),
    eq("=")))(str);
}

let titletext:parserfunc = 
  seq(
    match(/[^\n\r=]/),
    multiple(seq(
      eq("="),
      match(/[^\n\r]/)
    )))

let newline: parserfunc = 
  or(title,plain);

export let doc: parserfunc =
  seq(
    newline,
    multiple(
      seq(linebreak,newline)));

export function multiple(func: parserfunc,min?:number,max?:number): parserfunc {
  return (str) => {
    let times = -1;
    let receive = true, newstr = str;
    do {
      times++;
      [receive, newstr] = func(newstr);
    } while (receive)
    if(min && times<min){
      return [false, newstr];
    }else if(max && times>=max){
      return [false, newstr];
    }else{
      return [true, newstr];
    }
  }
}

export function or(...functions: parserfunc[]): parserfunc {
  return (str) => {
    for (let func of functions) {
      let [receive, next] = func(str);
      if (receive) {
        return [true, next];
      }
    }
    return [false, str];
  }
}

export function seq(...functions: parserfunc[]): parserfunc {
  return (str) => {
    let receive = true, newstr = str;
    for (let func of functions) {
      [receive, newstr] = func(newstr);
      if (receive) {
      } else {
        return [false, newstr]
      }
    }
    return [true, newstr]
  }
}

export function eq(expected: string): parserfunc {
  return (str) => {
    if (str.length>0 && str.indexOf(expected) == 0) {
      return [true, str.slice(expected.length)]
    } else {
      return [false, str];
    }
  }
}

export function match(pattern: RegExp): parserfunc {
  return (str) => {
    let res = str.match(pattern);
    if (str.length>0 && res?.index === 0) {
      return [true, str.slice(res[0].length)]
    } else {
      return [false, str];
    }
  }
}
