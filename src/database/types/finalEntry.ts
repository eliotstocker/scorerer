import {Entry} from "./entry";
import {Answer} from "./answer";

export interface FinalEntry extends Entry {
    answers?: Answer[];
    scores?: {
        overall: number,
        [k: string]: number;
    }
}