import {User} from "../database/types/user";
import {Domain} from "../database/types/domain";
import {Entry} from "../database/types/entry";

type ErrResponse = {
    error?: string;
}

export function HandleAPIErrorStatus(resp: Response) : Promise<Response> {
    if(resp.status > 399) {
        return resp.json()
            .then((d: ErrResponse) => Promise.reject(Error(d.error ? d.error : `api error: ${resp.status}`)));
    }
    return Promise.resolve(resp);
}

export function getCurrentUser() : Promise<User> {
    return fetch('/api/user', {
        credentials: "include"
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((u: User) => u);
}

export function getUser(id: number): Promise<User> {
    return fetch(`/api/user/${id}`, {
        credentials: "include"
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((u: User) => u);
}

export function getUsers(domain: number): Promise<User[]> {
    return fetch(`/api/${domain}/users`, {
        credentials: "include"
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((u: User[]) => u);
};

export function login(user: User) : Promise<User> {
    return fetch('/api/user', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(user),
        credentials: "include"
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((u: User) => u);
}

export function getInherentDomain() {
    return fetch(`/api/domain`, {
        credentials: "include"
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((d: Domain) => d);
}

export function getDomain(id: number) {
    return fetch(`/api/${id}`, {
        credentials: "include"
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((d: Domain) => d);
}

export function getDomainEntries(domainId: number) {
    return fetch(`/api/${domainId}/entries`, {
        credentials: "include"
    })
        .then(HandleAPIErrorStatus)
        .then(resp => resp.json())
        .then((e: Entry[]) => e);
}