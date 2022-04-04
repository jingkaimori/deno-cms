
export type plainDocument = {
    name: string;
    raw: string;
    childs: plainDocument[];
    auxilary:Record<string,string|number|boolean>;
}