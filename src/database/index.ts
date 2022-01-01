import { Low, JSONFile } from 'lowdb';
import { join } from 'path';
import {User} from "./types/user";
import {Answer} from "./types/answer";
import {Domain} from "./types/domain";
import {Entry} from "./types/entry";
import {FinalEntry} from "./types/finalEntry";
import {Theme} from "./types/theme";

const file = join(process.cwd(), '.score_db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);
let initialised = false;

interface DB {
    users: User[],
    domains: Domain[],
    entries: Entry[],
    answers: Answer[],
    themes: Theme[]
}

export function initialise() : Promise<void> {
    if(initialised) {
        return Promise.resolve();
    }

    return db.read()
        .then(() => {
            db.data ||= {
                users: [],
                domains: [],
                entries: [],
                answers: [],
                themes: []
            };
        })
        .then(() => {
            initialised = true;
            // sync db every 10 min
            setInterval(flush, 10 * 60 * 1000);
        });
}

export function flush() : Promise<void> {
    return db.write();
}

function getDBData() : DB {
    return <DB>db.data;
}

function getIDForTable(table: string) {
    // @ts-ignore
    const t : any[] | undefined = getDBData()[table];

    if(!t || !Array.isArray(t)) {
        throw new Error(`cant find table: ${table}`);
    }

    if(t.length < 1) {
        return 0;
    }

    return t.reduce((acc, item) => {
        if(item.id && item.id > acc) {
            return item.id;
        }
        return acc;
    }, 0) + 1;
}

export function getUser(id: number) : User {
    const user = getDBData().users.find(user => user.id == id);
    if (!user) {
        throw new Error(`user with id '${id}' not found...`);
    }

    return user;
}

export function getUsers() : User[] {
    return getDBData().users;
}

export function addUser(user: User) : User {
    user.id = getIDForTable('users');

    if(user.id == 0) {
        user.isAdmin = true;
    }

    getDBData().users.push(user);

    return user;
}

export function updateUser(id: number, user: User) : User {
    const index = getDBData().users.findIndex(u => u.id === id);

    user.id = id;
    getDBData().users[index] = user;

    return user;
}

export function getDomain(id: number) : Domain {
    const domain = getDBData().domains.find(domain => domain.id === id);
    if (!domain) {
        throw new Error(`domain with id '${id}' not found...`);
    }

    return domain;
}

export function getDomainByIdentifier(identifier: string) : Domain {
    const domain = getDBData().domains.find(domain => domain.identifier === identifier);
    if (!domain) {
        throw new Error(`domain with identifier '${identifier}' not found...`);
    }

    return domain;
}

export function getDomains() : Domain[] {
    return getDBData().domains;
}

export function addDomain(domain: Domain) : Domain {
    domain.id = getIDForTable('domains');

    getDBData().domains.push(domain);

    return domain;
}

export function getTheme(themeId: number) {
    const theme = getDBData().themes.find(theme => theme.id === themeId);

    if (!theme) {
        throw new Error(`theme with id '${themeId}' not found...`);
    }

    return theme;
}

export function createTheme(theme: Theme) {
    theme.id = getIDForTable('themes');

    getDBData().themes.push(theme);

    return theme;
}

export function updateTheme(id: number, theme: Theme) {
    const index = getDBData().themes.findIndex(t => t.id === id);

    theme.id = id;
    getDBData().themes[index] = theme;

    return theme;
}

export function updateDomain(id: number, domain: Domain) : Domain {
    const index = getDBData().domains.findIndex(d => d.id === id);

    domain.id = id;
    getDBData().domains[index] = domain;

    return domain;
}

export function getEntry(id: number) : Entry {
    const entry = getDBData().entries.find(entry => entry.id === id);
    if (!entry) {
        throw new Error(`entity with id '${id}' not found...`);
    }

    return entry;
}

export function getEntries(domainId: number) : Entry[]{
    return getDBData().entries.filter(entry => entry.domain === domainId);
}

export function addEntry(entry: Entry) : Entry {
    entry.id = getIDForTable('entries');

    getDBData().entries.push(entry);

    return entry;
}

export function updateEntry(id: number, entry: Entry) : Entry {
    const index = getDBData().entries.findIndex(e => e.id === id);

    if (index < 1) {
        throw new Error('could not update entry, not found...');
    }

    entry.id = id;
    getDBData().entries[index] = entry;

    return entry;
}

export function deleteEntry(id: number) : number {
    const index = getDBData().entries.findIndex(e => e.id === id);

    if(index < 0) {
        throw new Error('cloud not find entry to delete');
    }

    //remove item by index
    getDBData().entries.splice(index, 1);

    return id;
}

export function getAnswers(userId: number, entryId: number) : Answer[] {
    return getDBData().answers.filter(({user, entry}) => user == userId && entry === entryId);
}

export function getAllAnswers(entryId: number) : Answer[] {
    return getDBData().answers.filter(({entry}) => entry === entryId);
}

export function setAnswer(answer: Answer) {
    const index = getDBData().answers
        .findIndex(({user, entry, rank}) => answer.user === user && answer.entry === entry && answer.rank === rank);

    if (index > -1) {
        getDBData().answers[index] = answer;
        return answer;
    }

    getDBData().answers.push(answer);
    return answer;
}

export function getDomainAnswers(domainId: number) : FinalEntry[] {
    const entries = getEntries(domainId);

    return entries.map(entry => {
        return {
            ...entry,
            answers: getAllAnswers(<number>entry.id)
        };
    })
}