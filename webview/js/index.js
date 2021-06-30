/// @ts-check
"use strict";

/** @type {Record<string,(tree:Node)=>Node>} */
let renderMappers = {
    "TeXmacs":function passTexmacsRoot(tree){
        return tree;
    },
    // TODO: META INFO
    "#document":function passRoot(tree){
        // tree is document;
        let texmacs = tree.firstChild
        let children = Array.from(texmacs.childNodes.values())
        let body = children.find((v)=>{return v.nodeName=="body"})
        let newRoot = document.createElement("article");
        newRoot.append(...body.childNodes);
        return newRoot;
    },
    "#text":function passText(tree){
        return tree;
    },
    "nbsp":function (tree){
        return document.createTextNode("&nbsp;");
    },
    "tm-sym":function passSymbolText(tree) {
        let matched = tree.firstChild.nodeValue.match(
            /#([0-9a-zA-Z]*)/
        );
        if(matched[0]){
            return document.createTextNode(String.fromCodePoint(Number("0x"+matched[1])))
        }else{
            //TODO: Alphabet text entity
            return tree;
        }
    },
    // TODO:refractor structure ,then convert section in its own pass
    "tm-par":function passParagraph(tree){
        let sectionNeedMerge = {
            "section" : "h2",
            "subsection" : "h3",
            "subsubsection" : "h4",
            "doc-data" : "doc-data",
        }
        //extract sections
        if(tree.childNodes.length==1){
            //console.info(tree.childNodes[0].nodeName)
            let sectionIndex = tree.childNodes[0].nodeName.trim()
            let sectionName = sectionNeedMerge[sectionIndex];
            if(sectionName){
                /** @type {Node} */
                let sectionSourceTree = tree.childNodes[0]
                let passSelected = renderMappers[tree.nodeName];
                if(passSelected){
                    sectionSourceTree = passSelected(sectionSourceTree)
                }else{
                    reportUnknown(sectionSourceTree)
                }
                let subtitle = document.createElement(sectionName)
                
                subtitle.append(...sectionSourceTree.childNodes)
                return subtitle
            }else{
                let par = document.createElement("p")
                par.append(...tree.childNodes)
                return par;
            }
        }else{
            let par = document.createElement("p")
            par.append(...tree.childNodes)
            return par;
        }
    },
    "doc-title":function(tree){
        let par = document.createElement("h1")
        par.append(...tree.childNodes)
        return par;
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

        let displayTree = tree.cloneNode(true)
        //displayTree = adjustTreeStructure(displayTree)
        displayTree = mapNode(displayTree)
        console.log(displayTree)
        console.log(tree)
        document.querySelector("#rendered").appendChild(displayTree);
        //console.log(tree)
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
 * @param {Node} tree */
 function mapNode(tree){
    let passSelected = renderMappers[tree.nodeName];
    let resTree = tree;
    if(passSelected){
        resTree = passSelected(tree)
    }else{
        reportUnknown(tree)
    }
    // change to leaf element should not override their parents
    for(let i of resTree.childNodes){
        let childResTree = mapNode(i);
        //console.info(tree.children )
        resTree.replaceChild(childResTree,i);
    }
    return resTree;
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
        //console.log(i,tree.childNodes)
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



