import { Lexer, marked } from "../../deps.ts";
import { parser, treeNode, rootTreeNode, semanticsTreeNode } from "../macros/macros.ts";

export const doc:parser = (str)=>{
    const lexer = new Lexer({gfm:true});
    const tree:rootTreeNode = new treeNode("root")
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
function convertToTreeNode(obj:marked.Token,parent:semanticsTreeNode){
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
    }else if(obj.type == "escape"){
        node.name = "rawtext"
        node.raw = obj.text
    }else if(obj.type == "text"){
        // text token which contains subnode is concrete node
        // since santilizer option is unset, tag should have 'html' type
        const textobj = obj as marked.Tokens.Text
        if(typeof textobj.tokens !== 'undefined'){
            node.name = "concrete"
        }
    }

    if(obj.type == "code"){
        const textnode = new treeNode("text")
        textnode.raw = obj.text
        node.appendchild(textnode)
        if(typeof obj.lang !== 'undefined'){
            textnode.auxilary.lang = obj.lang
        }
    }else if(obj.type == "list"){
        obj.items.forEach((v)=>{
            convertToTreeNode(v,node);
        })
    }else if(obj.type == "codespan"){
        const textnode = new treeNode("text")
        textnode.raw = obj.text
        node.appendchild(textnode)
    }else if(obj.type == "table"){
        const head = new treeNode("trow")
        for(const header of obj.header){
            const headcellnode = new treeNode("theadcell")
            header.tokens.forEach((v)=>{
                convertToTreeNode(v,headcellnode);
            })
            head.appendchild(headcellnode)
        }
        node.appendchild(head);

        for(const row of obj.rows){
            const rownode = new treeNode("trow")
            for(const cell of row){
                const cellnode = new treeNode("tcell")
                cell.tokens.forEach((v)=>{
                    convertToTreeNode(v,cellnode);
                })
                rownode.appendchild(cellnode)
            }
            node.appendchild(rownode)
        }
    }else if(obj.type == "link"){
        const hrefnode = new treeNode("linkdest")
        hrefnode.raw = obj.href
        node.appendchild(hrefnode)
        
        const hintnode = new treeNode("hint")
        hintnode.raw = obj.title
        hrefnode.raw = obj.href
        node.appendchild(hintnode)

        const textnode = new treeNode("linktext")
        obj.tokens.forEach((v)=>{
            convertToTreeNode(v,textnode);
        })
        node.appendchild(textnode)
    }else if("tokens" in obj && typeof obj.tokens !== 'undefined'){
        obj.tokens.forEach((v)=>{
            convertToTreeNode(v,node);
        })
    }else{
        // node.childs = [];
    }
    parent.appendchild(node);
    return node
}