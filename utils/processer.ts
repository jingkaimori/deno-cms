// deno-lint-ignore-file ban-types
"use strict";

export class Processors<
    T extends Record<string, Function>,
    DefaultFunc extends Function = T[string],
> {
    #list: Map<keyof T, T[keyof T]>;
    #default: DefaultFunc;
    getProcessor(key: keyof T): T[typeof key] | DefaultFunc {
        if (this.#list.has(key)) {
            return this.#list.get(key) as T[typeof key];
        } else {
            return this.#default;
        }
    }
    hasProcessor(key: keyof T): boolean {
        return this.#list.has(key);
    }
    constructor(register: T, defaultP: DefaultFunc) {
        this.#list = new Map(Object.entries(register)) as Map<
            keyof T,
            T[keyof T]
        >;
        this.#default = defaultP;
    }
}
