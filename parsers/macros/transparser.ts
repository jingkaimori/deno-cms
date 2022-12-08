// import { parsercontextlabel, parserevent, parserfunc, parservar } from "./types.ts"
// import { treeNode, nonrootNode, value, errormessage, generalNode } from "./utility.ts";
// type transparserfunc = (ipttree:Readonly<IterableIterator<treeNode<nonrootNode>>>)=>{str:string,receive:boolean}

// export function transparser(tree:treeNode<generalNode>):string {
//   switch(tree.name){
//     case 'root':
//       const before='',after=''
//       let res = ''
//       for(const item of tree.childs){
//         s
//       }
//       return before+after;
//   }
// }


















// /**
//  * manually guard that left 
//  * some CSG will left recursive finite times
//  * @param func 
//  * @param type display label for this guard def
//  * @param label lookup label for this func
//  */
// export function guard(func: parserfunc, type: string, label?:parservar<string>):parserfunc {
//   const guardfunc:parserfunc = (str, context, stack, event) => {
//     if(safemode){
//         const labelres = stack.find((v)=>v.func==guardfunc);
//         if(labelres !== undefined){
//           if(str == labelres.strremain){
//             throw new Error(errormessage.leftrecurse)
//           }
//         }
//         stack.push({
//           type:type,
//           label:label===undefined?"":value(label,context),
//           func:guardfunc,
//           strremain:str,
//         });
//         let res = func(str, context, stack, event);
//         stack.pop();
//         return res;
//     }else{
//       return func(str, context, stack, event);
//     }
//   }
//   return guardfunc;
// }

// export function symbol(func: transparserfunc): transparserfunc {
//   const __symbol:transparserfunc = (context) => {
//     let current
//     if(context.childs.length == 0){
//         return {str:context.raw,receive:true};
//     }else{
//         const {str,receive} = func(context);
//         return {str,receive}
//     }
//   }
//   return __symbol;
// }

// export function multiple(
//   func: transparserfunc,
//   min?: parservar<number>,
//   max?: parservar<number>,
// ): transparserfunc {
//   return (context) => {
//     let times = -1;
//     let receive = true, loopstr = originstr;
//     do {
//       times++;
//       const laststr = loopstr;
//       [receive, loopstr] = func(loopstr, context, stack, event);
//       if(laststr == loopstr&&receive&&safemode){
//         throw new Error(errormessage.leftrecurse)
//       }
//     } while (receive);
//     if (min && times < value(min,context)) {
//       return {str:context.raw,receive:false};
//     } else if (max && times >= value(max,context)) {
//       return {str:context.raw,receive:false};
//     } else {
//       return {str:context.raw,receive:true};
//     }
//   };
// }

// export function not(func: parserfunc): parserfunc {
//   return guard((str, context, stack, event) => {
//     const [receive,] = func(str, context.clone(), stack, event);
//     if (receive) {
//       return [false, str];
//     } else {
//       return [true, str.slice(1)];
//     }
//   },"not");
// }

// /**
//  * this func is deprecated due to inrevertable change to nodes
//  * image that this func modify content in grandparent, but parent is rejected, so parent is removed but modification for grandparent is kept.
//  * function should only modify its current treeNode, getters is responsible to grab info from slibings
//  * @deprecated
//  * @param func 
//  * @param modifier 
//  * @returns 
//  */
// export function modifycontext(func:parserfunc,modifier:(str:string,laststr:string,context:treeNode<generalNode>)=>void):parserfunc{
//   return (str:string,context,stack, event)=>{
//     const [receive, laststr] = func(str, context,stack, event);
//     if (receive)  {
//       modifier(str,laststr,context);
//     }
//     return [receive,laststr]
//   }
// }

// export function or(...functions: parserfunc[]): parserfunc {
//   return guard((str, context, stack, event) => {
//     warnSubparserNums(event,stack,"or",...functions)
//     for (const func of functions) {
//       const [receive, next] = func(str, context, stack, event);
//       if (receive) {
//         return [true, next];
//       }
//     }
//     return [false, str];
//   },"or");
// }

// export function seq(...functions: parserfunc[]): parserfunc {
//   return guard((str, context, stack, event) => {
//     warnSubparserNums(event,stack,"seq",...functions)
//     let receive = true, newstr = str;
//     for (const func of functions) {
//       [receive, newstr] = func(newstr, context, stack, event);
//       if (receive) {
//         //continue loop
//       } else {
//         return [false, str];
//       }
//     }
//     return [true, newstr];
//   },"seq");
// }

// export function getparserfunc(name:string):parserfunc {
//   return (str,ctx,stack, event)=>{
//     const labelres = stack.find((v)=>v.label==name);
//     if(labelres === undefined){
//       throw new Error(errormessage.undefinedfunc)
//     }else{
//       const func = labelres.func;
//       return func(str,ctx,stack, event);
//     }
//   }
// }

// /**
//  * not recommend to use out of macro meta defs
//  * @param functions 
//  */
//  function  __warnSubparserNums(context:Function,...functions: parserfunc[]): void {
//   if(functions.length<2){
//     console.warn(context.name + "has less than two sub-parsers. maybe this is an error.")
//   }
// }

// function warnSubparserNums(events:parserevent[],stack:parsercontextlabel[],label:string,...functions: parserfunc[]): void {
//   if(functions.length<2){
//     const event:parserevent = {
//       type:"Sub-parser num mismatch",
//       context: Array.from(stack),
//       desc:label + "has less than two sub-parsers. maybe this is an error."
//     }
//     events.push(event)
//   }
// }