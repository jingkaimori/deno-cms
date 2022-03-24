// @deno-types="https://cdn.jsdelivr.net/npm/@types/marked@4.0.1/index.d.ts"
import { Lexer, marked } from "https://cdn.jsdelivr.net/npm/marked@4.0.10/lib/marked.esm.js";
import { parser, treeNode, nodeType, rootTreeNode, generalTreeNode } from "../../macros/macros.ts";

export const doc:parser = (str)=>{
    const lexer = new Lexer({gfm:true});
    const tree:rootTreeNode = new treeNode<nodeType.root>("root")
    lexer.lex(str)
    .filter((v)=> v.type != "space")
    .forEach((v)=>{return convertToTreeNode(v,tree)});

    return {
        leftstr:"",
        stack:[],
        success:true,
        tree,
        events:[]
    }
}

/**
 * 
 * @param obj 
 * @param parent 
 * @returns 
 * @todo handle escape character
 */
function convertToTreeNode(obj:marked.Token,parent:generalTreeNode){
    const node:treeNode = new treeNode(obj.type)
    node.raw = obj.raw
    if(obj.type == "heading"){
        node.name = "title"
        node.auxilary = {level:obj.depth}
    }else if(obj.type == "list"){
        if(obj.ordered){
            node.name = "olist"
        }else{
            node.name = "ulist"
        }
    }else if(obj.type == "link"){
        node.auxilary = {dest:obj.href,title:obj.title}
    }else if(obj.type == "escape"){
        node.name = "rawtext"
        node.raw = obj.text
    }

    if("tokens" in obj && typeof obj.tokens !== 'undefined'){
        obj.tokens.forEach((v)=>{
            convertToTreeNode(v,node);
        })
    }else if(obj.type == "code"){
        const textnode = new treeNode("text")
        textnode.raw = obj.text
        node.appendchild(textnode)
        if(typeof obj.lang !== 'undefined'){
            const langnode = new treeNode("language")
            langnode.raw = obj.lang
            // node.childs
        }
    }else if(obj.type == "list"){
        obj.items.forEach((v)=>{
            convertToTreeNode(v,node);
        })
    }else if(obj.type == "codespan"){
        const textnode = new treeNode("text")
        textnode.raw = obj.text
        node.appendchild(textnode)
    }else{
        // node.childs = [];
    }
    parent.appendchild(node);
    return node
}