/// @ts-check
"use strict";

/** @type {Record<string,(tree:Node)=>Node>} */
let renderMappers = {
    "TeXmacs":function passTexmacsRoot(tree){
        //tree.firstChild.nodeName == "TeXmacs";
        return tree;
    },
    // TODO: META INFO
    "#document":function passRoot(tree){
        // tree is document;
        let texmacs = tree.firstChild
        let version=texmacs.getAttribute("version");
        let children = Array.from(texmacs.childNodes.values())
        let body = children.find((v)=>{return v.nodeName=="body"})
        let newRoot = document.createElement("article");
        //console.log(...tree.children)
        newRoot.prepend(`Create by TeXmacs version ${version}`)
        newRoot.append(...body.childNodes);
        return newRoot;
    },
    "#text":function passText(tree){
        return tree;
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
    "tm-par":function passParagraph(tree){
        let sectionNeedMerge = {
            "section" : "h2",
            "subsection" : "h3",
            "subsubsection" : "h4",
        }
        //extract sections
        if(tree.childNodes.length==1){
            //console.info(tree.childNodes[0].nodeName)
            let section = sectionNeedMerge[tree.childNodes[0].nodeName.trim()]
            if(section){
                let subtitle = document.createElement(section)
                subtitle.append(...tree.childNodes[0].childNodes)
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
    }
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
        let displayTree = tree.cloneNode(true)
        //displayTree = adjustTreeStructure(displayTree)
        displayTree = mapNode(displayTree)
        console.log(displayTree)
        console.log(tree)
        document.querySelector("#rendered").appendChild(displayTree);
        //console.log(tree)
    }else{ /* do nothing */; }
})

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



