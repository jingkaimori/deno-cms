export function getArticleTitle(filename: string) {
    return ("./export/" + filename.replace(/\./g, "/") + ".xml");
  }

export const clearChilds = (element: HTMLElement): void => {
    Array.from(element.childNodes)
      .forEach(element.removeChild, element);
  };
  export const nodeIsChild = (node: Node | null | undefined): node is ChildNode => {
    const parent = node?.parentElement;
    return !(parent === null || parent === undefined);
  };
  // deno-lint-ignore no-explicit-any
  export const throttleEventHandler = <handlerType extends (this: EventTarget, event: Event) => any>(handler: handlerType): handlerType => {
    let counter = 0;
    // deno-lint-ignore no-explicit-any
    return (function(this: EventTarget, event: Event): any {
      const timediff = event.timeStamp - counter;
      if(timediff > 8) {
        counter = event.timeStamp;
        return handler.call(this, event);
      } else {
        return;
      }
    } as handlerType);
  };
  