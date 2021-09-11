
export function consumedstr(str:string,newstr:string){
  if (newstr.length > 0) {
    return str.slice(0, str.indexOf(newstr));
  } else {
    return str;
  }
}
