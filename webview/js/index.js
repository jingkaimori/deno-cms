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
        output.append(par)
        return [par,{}];
    },
    "section":function name(tree,output,context) {
        let title = document.createElement("h2");
        output.append(title);
        return [title,{}];
    },
    "subsection":function name(tree,output,context) {
        let title = document.createElement("h3");
        output.append(title);
        return [title,{}];
    },
    "subsubsection":function name(tree,output,context) {
        let title = document.createElement("h4");
        output.append(title);
        return [title,{}];
    },
    "#text":function passText(tree,output,context){
        let text = document.createTextNode(tree.nodeValue);
        output.append(text);
        return [output,{}];
    },
    "nbsp":function (tree,output,context){
        let text = document.createTextNode(" ");
        output.append(text);
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
        }
        return [output,{}];
    },
    // TODO:handle par not in <\body|xxx>yyy</body>
    "tm-par":function passParagraph(tree,output,context){
        let par = document.createElement("p")
        output.append(par)
        return [par,{}]
    },
    "equation_42_":function(tree,output,context){
        let math = document.createElementNS("http://www.w3.org/1998/Math/MathML","math")
        // let param = tree.firstChild
        // math.append(...param.childNodes)
        return [math,{mode:"math"}];
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
        displayMetadata(articleInfo)

        // let displayTree = tree.cloneNode(true)
        let [displayTree,] = mapNode(
            tree.cloneNode(true),document.createElement("article"),[{mode:"none"}]
        )
        console.log(displayTree)
        console.log(tree)
        
        let renderedDoc = document.querySelector("#rendered")
        renderedDoc.childNodes.forEach(renderedDoc.removeChild,renderedDoc);
        renderedDoc.appendChild(displayTree);
    }else{ /* do nothing */; }
})

function displayMetadata(obj){
    let metadatatable = /** @type {HTMLTableSectionElement}*/(document.querySelector("#metadata"));
    metadatatable.childNodes.forEach(metadatatable.removeChild,metadatatable);
    displayFields(obj,metadatatable,"");
}

/** 
 * @param {string} key
 * @param {Readonly<HTMLElement>} DOMTable
*/
function displayFields(obj,DOMTable,key){
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
            DOMTable.appendChild(row);
        }else{
            displayFields(obj[i],DOMTable,newkey)
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
    "doc-author":function (t,data){
        data.authorlist=[];
        return data;
    },
    "author-data":function (t,data){
        let newauthor = {}
        data.authorlist.push(newauthor)
        return newauthor;
    },
    "author-name":function (t,data){
        data.name = t.firstChild.nodeValue;
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
    // console.group()
    let passSelected = dataMappers[tree.nodeName];
    let nextContext = context;
    if(passSelected){
        nextContext = passSelected(tree,context) || context;
    }else{ /* do nothing */; }

    // console.log(context)
    // console.groupEnd()
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



