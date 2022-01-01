import {Domain} from "../../database/types/domain";
import {Entry} from "../../database/types/entry";

export function getDomains() : Promise<Domain[]> {
    return fetch('/api/domains', {
        credentials: "include"
    })
        .then(resp => resp.json())
        .then((d: Domain[]) => d);
}

export function newDomain(domain: Domain) : Promise<Domain> {
    return fetch('/api/domain', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: "include",
        method: 'POST',
        body: JSON.stringify(domain)
    })
        .then(resp => resp.json())
        .then((d: Domain) => d);
}

export function updateDomain(domain: Domain) : Promise<Domain> {
    return fetch(`/api/${domain.id}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: "include",
        method: 'PUT',
        body: JSON.stringify(domain)
    })
        .then(resp => resp.json())
        .then((d: Domain) => d);
}

export function deleteEntry(domain: Domain, entry: Entry) : Promise<number> {
    return fetch(`/api/${domain.id}/${entry.id}`, {
        credentials: "include",
        method: 'DELETE',
    })
        .then(resp => resp.json())
        .then((id): number => id);
}