import * as xwiki from "../../parsers/xwiki.ts";
import type { rootTreeNode } from "../../macros/macros.ts";
import * as markdown from "../../parsers/borrowed/markdown.ts"
import * as tmml from "../../parsers/borrowed/texmacs-tmml.ts"
import { Site } from "../../types/repository.ts";
import { getArticleTitle, mapNode } from "./render.ts";
import { path } from "./deps.ts"
import { clearChilds } from "./utility.ts";
import { RPCTest } from "./remote.ts";

const mode = {meta:"local",format:"tmml"};
const treeHTMLNodeMap:WeakMap<HTMLElement,rootTreeNode> = new WeakMap();
const treeHTMLTextMap:WeakMap<HTMLElement,rootTreeNode> = new WeakMap();

const selectElem = document.querySelector("#format") as HTMLSelectElement
selectElem.addEventListener("change",(_ev)=>{
  if(selectElem.value == "local-tmml"){
    mode.meta="local"
    mode.format="tmml"
  }else if(selectElem.value == "local-markdown"){
    mode.meta="local"
    mode.format="md"
  }else if(selectElem.value == "xwiki-xwiki"){
    mode.meta="xwiki"
    mode.format="xwiki"
  }else{
    console.error("unsupported select")
  }
  onFormatChange()
})

const onFormatChange = async () => {
  const list = document.querySelector("#list") as HTMLUListElement
  clearChilds(list)
  if(mode.meta == "xwiki") {
    const res = await fetch("./export/package.xml");
    const parser = new DOMParser();
    const tree = parser.parseFromString(await res.text(), "text/xml") as XMLDocument;
    const files = tree.querySelectorAll("package > files > *");
    files.forEach((v) => {
      const li = document.createElement("li");
      li.classList.add("filename");
      li.innerText = String(v.firstChild?.nodeValue);
      li.addEventListener("click", handleClick);
      list.append(li);
    });
  } else if(mode.meta == "local") {
    const res = await fetch("./export/meta.json");
    const tree = await res.json() as Site;
    const files = tree.articles;
    files.forEach((v) => {
      const li = document.createElement("li");
      li.classList.add("filename");
      li.innerText = String(v.path);
      li.addEventListener("click", handleClick);
      list.append(li);
    });

  }
}

async function handleClick(this:HTMLLIElement) {
  const filename = this.firstChild?.nodeValue;
  if (filename) {
    if(mode.format == "xwiki"){
      const first = await fetch(getArticleTitle(filename));
      const parser = new DOMParser();
      //Firefox don't support xml 1.1, so downgrade version
      const text = (await first.text()).replace(
        "<?xml version='1.1",
        "<?xml version='1.0",
      );
      const xmltree = parser.parseFromString(text, "text/xml") as XMLDocument;
      console.log(xmltree);
      const content = String(
        xmltree.querySelector("xwikidoc > content")?.firstChild?.nodeValue,
      );
      const {success:res,leftstr:rest,tree} = xwiki.doc(content);
      renderResult(content,res,rest);
      renderDoc(tree);
    }else if(mode.format == "md"){
      const first = await fetch(path.join("./export",filename));
      const text = await first.text();
      const {success,leftstr,tree} = markdown.doc(text);
      renderResult(text,success,leftstr);
      renderDoc(tree);
    }else if(mode.format == "tmml"){
      const first = await fetch(path.join("./export",filename));
      const text = await first.text();
      const {success,leftstr,tree} = tmml.doc(text);
      renderResult(text,success,leftstr);
      renderDoc(tree);
    }
  } else { /* do nothing */ }
}

/**
 * 
 * @param content the whole string to be parse
 * @param res 
 * @param rest the part left by parser
 */
const renderResult = (content:string,res:boolean,rest:string) => {

  const statElem=
    document.querySelector("#stat") as HTMLParagraphElement;
  if(res){
    statElem.classList.add("success");
    statElem.classList.remove("failure");
    statElem.innerText = "success";
  }else{
    statElem.classList.add("failure");
    statElem.classList.remove("success");
    statElem.innerText = "failure";
  }

  console.log(rest)
  const frontElement = document.querySelector("#diff > #front") as HTMLSpanElement
  const endElement = document.querySelector("#diff > #end") as HTMLSpanElement
  clearChilds(frontElement);
  clearChilds(endElement);
  if(rest.length==0){
    //all chars are used, no need to get rest chars
  }else{
    let splitstr = content.slice(0,content.indexOf(rest))
    let begini = splitstr.lastIndexOf("\n")
    let beginp = splitstr;
    if(begini>0){
      beginp = splitstr.slice(begini);
    }

    let endi = rest.indexOf('\n')
    let endp = rest;
    if(endi>0){
      endp = rest.slice(0,endi);
    }

    frontElement.textContent = beginp
    endElement.textContent = endp
  }
}

RPCTest();

/**
 * convert semantic tree into DOM tree
 * @param tree 
 */
const renderDoc = (tree:rootTreeNode) => {
  console.log(tree.toPlainObject());
  // let displayTree = tree.cloneNode(true)
  const displayTreeRoot = document.createElement("div")
  console.groupCollapsed()
  const [displayTree] = mapNode(
    tree,
    displayTreeRoot,
    treeHTMLNodeMap,
    treeHTMLTextMap
  );
  console.groupEnd()
  console.log(treeHTMLNodeMap, treeHTMLTextMap);

  const renderedDoc: HTMLDivElement =
    (document.querySelector("#rendered") as HTMLDivElement);
    clearChilds(renderedDoc);
  renderedDoc.appendChild(displayTree);
  
}

export const getEditableTextNode = (rawtext:string) => {
  const text = document.createElement("span");
  text.innerText = rawtext;
  text.contentEditable = "true";
  text.addEventListener("input",function (ev){
    if (treeHTMLTextMap.has(this)) {
      const tree = treeHTMLTextMap.get(this) as rootTreeNode
      tree.raw = this.textContent || ""
    } else {
      throw new Error("why target is not a text node?");
      
    }
  })
  return text
}
