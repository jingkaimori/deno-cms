import { doc, postprocess } from "../../mediawiki.ts";
import { treeNode } from "../../macros.ts";
import { getArticleTitle, mapNode } from "./render.ts";

let res = await fetch("./export/package.xml");
const parser = new DOMParser();
let tree = parser.parseFromString(await res.text(), "text/xml") as XMLDocument;
let files = tree.querySelectorAll("package > files > *");

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
      doc(content, tree);
      postprocess(tree);

      console.log(tree.toString());
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
      renderedDoc.appendChild(displayTree);
    } else { /* do nothing */ }
  });
});

function clearChilds(element: HTMLElement): void {
  Array.from(element.childNodes)
    .forEach(element.removeChild, element);
}
