import { doc, postprocess } from "../../parsers/xwiki.ts";
import { treeNode } from "../../macros/macros.ts";
import { getArticleTitle, mapNode } from "./render.ts";

const res = await fetch("./export/package.xml");
const parser = new DOMParser();
const tree = parser.parseFromString(await res.text(), "text/xml") as XMLDocument;
const files = tree.querySelectorAll("package > files > *");

files.forEach((v) => {
  let li = document.createElement("li");
  li.classList.add("filename");
  li.innerText = String(v.firstChild?.nodeValue);
  (document.querySelector("#list") as HTMLUListElement).append(li);
});

let inputbox =
  (document.querySelectorAll(".filename") as NodeListOf<HTMLLIElement>);
inputbox.forEach((v) => {
  v.addEventListener("click", async function (e) {
    const filename = this.firstChild?.nodeValue;
    if (filename) {
      const first = await fetch(getArticleTitle(filename));
      const parser = new DOMParser();
      //Firefox don't support xml 1.1, so downgrade version
      const text = (await first.text()).replace(
        "<?xml version='1.1",
        "<?xml version='1.0",
      );
      let xmltree = parser.parseFromString(text, "text/xml") as XMLDocument;
      let content = String(
        xmltree.querySelector("xwikidoc > content")?.firstChild?.nodeValue,
      );
      let tree = new treeNode("root");
      let [res,rest] = doc(content, tree, []);
      postprocess(tree);

      let statElem=
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
      if(rest.length==0){
        //all chars are used, no need to get rest chars
      }else{
        let splitstr = content.slice(0,content.indexOf(rest))
        let begini = splitstr.lastIndexOf("\n")
        let beginp = splitstr;
        if(begini>0){
        beginp = splitstr.slice(begini);}

        let endi = rest.indexOf('\n')
        let endp = rest;
        if(endi>0){
          endp = rest.slice(0,endi);
        }

        (document.querySelector("#diff > #front") as HTMLSpanElement).innerText = beginp;
        (document.querySelector("#diff > #end") as HTMLSpanElement).innerText = endp;
      }
      console.log(tree);
      // let displayTree = tree.cloneNode(true)
      let [displayTree] = mapNode(
        tree,
        document.createElement("article"),
        [{ mode: "none" }],
      );
      console.log(displayTree);
      console.log(xmltree);

      let renderedDoc: HTMLDivElement =
        (document.querySelector("#rendered") as HTMLDivElement);
        clearChilds(renderedDoc);
        clearChilds((document.querySelector("#diff > #front") as HTMLSpanElement));
        clearChilds((document.querySelector("#diff > #end") as HTMLSpanElement));
      renderedDoc.appendChild(displayTree);
    } else { /* do nothing */ }
  });
});

function clearChilds(element: HTMLElement): void {
  Array.from(element.childNodes)
    .forEach(element.removeChild, element);
}
