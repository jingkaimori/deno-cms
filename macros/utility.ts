import { parserfunc, treeNode, parsercontextlabel } from "./types.ts";

export function getparser(parserfunc:parserfunc){
    return (str:string)=>{
        let tree = new treeNode("root");
        let stack:parsercontextlabel[] = [];
        let [success,leftstr] = parserfunc(str,tree,stack);
        return {
            tree,stack,success,leftstr
        }
    }
}