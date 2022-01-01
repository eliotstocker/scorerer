import {Answer} from "../../database/types/answer";
import {Entry} from "../../database/types/entry";
import {HandleAPIErrorStatus} from "../common";
import {Theme} from "../../database/types/theme";

export function addEntry(entry: Entry) : Promise<Entry> {
    return fetch(`/api/${entry.domain}/entry`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: "include",
        method: 'POST',
        body: JSON.stringify(entry)
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((e: Entry) => e);
}

export function updateEntry(entry: Entry) : Promise<Entry> {
    return fetch(`/api/${entry.domain}/${entry.id}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: "include",
        method: 'PUT',
        body: JSON.stringify(entry)
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((e: Entry) => e);
}

export function setAnswer(domainId: number, answer: Answer) : Promise<Answer> {
    return fetch(`/api/${domainId}/answer/${answer.entry}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: "include",
        method: 'POST',
        body: JSON.stringify(answer)
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((a: Answer) => a);
}

export function getAnswers(domainId: number, EntryId: number) : Promise<Answer[]> {
    return fetch(`/api/${domainId}/answers/${EntryId}`, {
        credentials: "include",
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((a: Answer[]) => a);
}

export type Scores = {
    entry: Entry,
    scores: {
        overall: number,
        [k: string]: number
    }
}

export function getScores(domainId: number) : Promise<Scores[]> {
    return fetch(`/api/${domainId}/scores`, {
        credentials: "include",
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((s: Scores[]) => s);
}

export function getTheme(domainId: number) : Promise<Theme> {
    return fetch(`/api/${domainId}/theme`, {
        credentials: "include",
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((t: Theme) => t);
}