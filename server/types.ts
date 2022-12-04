import { status } from "../types/errors.ts";
import { RemoteHash, RemoteValue } from "../types/repository.ts";

export type create<T extends RemoteValue> = (this:void,content:T) => RemoteHash<T> | status.INNER_ERROR;
export type retrieve<T extends RemoteValue> = (this:void,id:RemoteHash<T>) => T | status.INNER_ERROR | status.RESOURCE_NOT_FOUND
export type update<T extends RemoteValue> = (this:void,content:T, id:RemoteHash<T>) => void | status.RESOURCE_NOT_FOUND;
export type deletedata<T extends RemoteValue> = (this:void,id:RemoteHash<T>) => void | status.INNER_ERROR | status.RESOURCE_NOT_FOUND