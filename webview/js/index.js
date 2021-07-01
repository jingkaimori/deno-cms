/// @ts-check
"use strict";

/** @typedef {Record<string,any>} contextType */

/** 
 * @type {Record<string,(tree:Node,output:Element,context:Readonly< contextType >)=>[Element,contextType]>} 
 */
let renderMappers = {
    "TeXmacs":function passTexmacsRoot(tree,output,context){
        let removedChilds = [];
        for(let i of tree.childNodes){
            //console.log(i,tree.childNodes)
            switch(i.nodeName){
                case "style":
                case "references":
                case "auxiliary":
                removedChilds.push(i);
            }
        }
        removedChilds.every(tree.removeChild,tree);
        return [output,{}];
    },
    // TODO: META INFO
    "#document":function passRoot(tree,output,context){
        return [output,{}];
    },
    "body":function name(tree,output,context) {
        //context["mode"] = "text"
        //output.append(...tree.childNodes);
        return [output,{mode:"text"}];
    },
    "doc-title":function(tree,output,context){
        let par = document.createElement("h1")
        par.append(...tree.childNodes)
        output.append(par)
        return [par,{}];
    },
    "section":function name(tree,output,context) {
        let title = document.createElement("h2");
        title.append(...tree.childNodes);
        output.append(title);
        return [title,{}];
    },
    "subsection":function name(tree,output,context) {
        let title = document.createElement("h3");
        title.append(...tree.childNodes);
        output.append(title);
        return [title,{}];
    },
    "subsubsection":function name(tree,output,context) {
        let title = document.createElement("h4");
        title.append(...tree.childNodes);
        output.append(title);
        return [title,{}];
    },
    "#text":function passText(tree,output,context){
        if(context.mode=="text"){
            let par = document.createElement("p");
            par.innerText=tree.nodeValue
            output.append(par);
        }else{
            let text = document.createTextNode(tree.nodeValue);
            output.append(text);
        }
        return [output,{}];
    },
    "nbsp":function (tree,output,context){
        let text = document.createTextNode("&nbsp;");
        output.append(tree);
        return [output,{}];
    },
    "tm-sym":function passSymbolText(tree,output,context) {
        let matched = tree.firstChild.nodeValue.match(
            /#([0-9a-zA-Z]*)/
        );
        if(matched[0]){
            let charEntity = document.createTextNode(String.fromCodePoint(Number("0x"+matched[1])))
            output.append(charEntity)
        }else{
            //TODO: Alphabet text entity
            output.append(tree.cloneNode(false))
        }
        return [output,{}];
    },
    // TODO:handle par not in <\body|xxx>yyy</body>
    "tm-par":function passParagraph(tree,output,context){
        let par = document.createElement("p")
        par.append(...tree.childNodes)
        document.append(par)
        return [par,{}]
    },
}
/** @type {HTMLInputElement} */
let inputbox = document.querySelector("#fileinput");
inputbox.addEventListener("change",async function (e){
    const files=inputbox.files
    if(files.length>0){
        const first=files[0];
        const parser = new DOMParser();
        let tree = parser.parseFromString(await first.text(),"text/xml")
        tree = removeBlankText(tree)

        let articleInfo = {}
        scanMetaInfo(tree,articleInfo);
        displayMetadata(articleInfo,"")

        // let displayTree = tree.cloneNode(true)
        let [displayTree,] = mapNode(
            tree.cloneNode(true),document.createElement("article"),[{mode:"none"}]
        )
        console.log(displayTree)
        console.log(tree)
        document.querySelector("#rendered").appendChild(displayTree);
    }else{ /* do nothing */; }
})

let metadatatable = document.querySelector("#metadata");
/** @param {string} key*/
function displayMetadata(obj,key){
    //metadatatable.childNodes.forEach(metadatatable.removeChild,metadatatable);
    for(let i in obj){
        let newkey = key+"."+i
        if(typeof obj[i]!="object"){
            let row = document.createElement("tr");
            let def = document.createElement("td");
            let val = document.createElement("td");
            def.innerText=newkey
            val.innerText=obj[i]
            row.appendChild(def);
            row.appendChild(val);
            metadatatable.appendChild(row);
        }else{
            displayMetadata(obj[i],newkey)
        }
    }
}

/** @type {Record<string,(tree:Node,context:any)=>any>} */
let dataMappers = {
    "doc-data":function (t,data) {
        if(!data.docinfo){
            data.docinfo={};
        }
        return data.docinfo;
    },
    "doc-title":function (t,data){
        data.title = t.firstChild.nodeValue;
        return data;
    },
    "TeXmacs":function (t,data) {
        if(t.hasChildNodes()){
            console.log(t)
            let version=/** @type {Element} */(t).getAttribute("version");
            data.tmVersion=version
        }else{/** do nothing */}

        return data
    },
    "style":function(t,data){
        let tuple = t.firstChild
        data.packs = [];
        for(let i=0;i<tuple.childNodes.length;i++){
            let config=tuple.childNodes[i].firstChild.nodeValue;
            if(i==0){
                data.style=config;
            }else{
                data.packs.push(config)
            }
        }
    }
}

/**
 * @param {Node} tree
 * @param {{}} context
 */
function scanMetaInfo(tree,context){
    let passSelected = dataMappers[tree.nodeName];
    let nextContext = context;
    if(passSelected){
        nextContext = passSelected(tree,context) || context;
    }else{ /* do nothing */; }

    for(let i of tree.childNodes){
        scanMetaInfo(i,nextContext);
    }
    return context;

}

/**
 * map TMML node to HTML node
 * @todo give passed tree to subnode or raw tree? 
 * @param {Node} iptTree 
 * @param {Element} resTree
 * @param {Array<contextType>} contextStack
 * @returns {[Element,contextType]}
 */
 function mapNode(iptTree,resTree,contextStack){
    //console.group(iptTree.parentNode?.nodeName)
    //console.info(`${iptTree.parentNode?.nodeName}->${iptTree.nodeName}`,resTree.nodeName)
    let passSelected = renderMappers[iptTree.nodeName];
    let context = contextStack.reduce(
        (pre,cur)=>{ return Object.assign(pre,cur)}
    ,{});
    if(passSelected){
        let newScope = undefined;
        [resTree,newScope] = passSelected(iptTree,resTree,context)
        if(newScope!==undefined){
            contextStack.push(newScope)
        }else{ /* do nothing */; }
    }else{

        let iptCopy = /** @type {Element} */ (iptTree.cloneNode(false));
        resTree.appendChild(iptCopy);
        resTree=iptCopy
        reportUnknown(iptTree)
    }
    for(let i of iptTree.childNodes){
        mapNode(i,resTree,contextStack);
    }
    //console.groupEnd()
    return [resTree,context];
}

/**
 * remove blank text nodes
 * @template {Node} T   
 * @param {T} tree 
 * @returns {T}
 */
function removeBlankText(tree){
    //childNodes is dynamic, remove after scan to count all nodes. 
    let removedChilds = [];
    for(let i of tree.childNodes){
        if(i.nodeType==Node.TEXT_NODE&&/^\s*$/.test(i.nodeValue)){
            removedChilds.push(i);
        }else{
            removeBlankText(i);
        }
    }
    removedChilds.every(tree.removeChild,tree);
    return tree;
}

/** @param {Node} tree*/
function reportUnknown(tree){
    console.warn("Unknown node:",tree.nodeName)
}



