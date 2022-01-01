import { Router } from "express";
import bodyParser from "body-parser";
import * as validate from "../validators";
import {
    addDomain,
    addEntry,
    addUser, createTheme, deleteEntry, getAllAnswers, getAnswers,
    getDomain, getDomainAnswers, getDomainByIdentifier,
    getDomains, getEntries, getEntry, getTheme, getUser,
    setAnswer,
    updateDomain,
    updateEntry, updateTheme,
    updateUser
} from "../database";
import {Answer} from "../database/types/answer";
import {Entry} from "../database/types/entry";
import {User} from "../database/types/user";
import APIError from "../errors/APIError";
import {Theme} from "../database/types/theme";
import {CookieOptions} from "express-serve-static-core";

//add user to Express Request model
declare global {
    namespace Express {
        export interface Request {
            user?: User
        }
    }
}

function validateLogin(user : User | undefined) {
    if(!user || typeof user.id === 'undefined' ) {
        throw new APIError("you must be signed in to perform this action", 401);
    }
}

const router = Router();
//parse json data
router.use(bodyParser.json());

//get inherent domain
router.get('/domain', ({hostname}, res) => {
    const inherentDomain = getDomainByIdentifier(hostname);

    res.json(inherentDomain);
});

//create a new domain
router.post('/domain', ({body}, res) => {
    validate.domain(body);
    res.json(addDomain(body));
});

//get all domains
router.get('/domains', (req, res) => {
    res.json(getDomains());
});

//create a new user
router.post('/user', ({body}, res) => {
    validate.user(body);
    const user = addUser(body);

    const cookieOpts: CookieOptions = {
        signed: true,
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }

    if (process.env.SCORE_APP_COOKIE_DOMAIN) {
        cookieOpts.domain = process.env.SCORE_APP_COOKIE_DOMAIN;
    }

    res.cookie('__score_user', user.id, cookieOpts)
    res.json(user);
});

//update user
router.put('/user', ({body, user}, res) => {
    validateLogin(user);
    validate.user(body);

    // @ts-ignore
    res.json(updateUser(user.id, body));
});

//get current user info
router.get('/user', ({user}, res) => {
    validateLogin(user);
    res.json(user);
});

//get user info
router.get('/user/:user', ({params: {user}}, res) => {
    res.json(getUser(parseInt(user)));
});

//get domain object
router.get('/:domain', ({params: {domain}}, res) => {
    res.json(getDomain(parseInt(domain)));
});

//update domain object
router.put('/:domain', ({params: {domain}, body}, res) => {
    validate.domain(body);
    res.json(updateDomain(parseInt(domain), body));
});

//create new entry
router.post('/:domain/entry', ({params: {domain}, body}, res) => {
    validate.entry(body);
    const ent: Entry = body;

    if (ent.domain != parseInt(domain)) {
        throw new APIError('entry domain id does not match path', 404);
    }

    res.json(addEntry(ent));
});

//delete entry
router.delete('/:domain/:entry', ({params: {domain, entry}}, res) => {
    const ent = getEntry(parseInt(entry));

    if (ent.domain != parseInt(domain)) {
        throw new APIError('entry domain id does not match path', 404);
    }

    res.json({deleted: deleteEntry(parseInt(entry))});
});

//get entries for domain
router.get('/:domain/entries', ({params: {domain}}, res) => {
    const entries = getEntries(parseInt(domain));
    res.json(entries.sort((a, b) => (a.index || 0) - (b.index || 0)));
});

//update entry
router.put('/:domain/:entry', ({params: {domain, entry}, body, user}, res) => {
    validate.entry(body);
    const ent: Entry = body;

    if (ent.domain != parseInt(domain)) {
        throw new APIError('entry domain id does not match path');
    }

    const current = getEntry(parseInt(entry));

    if (!current) {
        throw new APIError(`cant find entry: ${entry}`, 404);
    }

    if (current.owner != user?.id) {
        throw new APIError('you may only update your own entries', 401);
    }

    res.json(updateEntry(parseInt(entry), ent));
});

//get users with entries on domain
router.get('/:domain/users', ({params: {domain}}, res) => {
    const entries = getEntries(parseInt(domain));
    const userIds = new Set(entries.map(({owner}) => owner));

    res.json(Array.from(userIds).map(getUser));
});

//get theme for domain
router.get('/:domain/theme', ({params: {domain}}, res) => {
    const dom = getDomain(parseInt(domain));

    if(typeof dom.theme == 'undefined') {
        return res.json({id: -1});
    }

    res.json(getTheme(dom.theme));
});

//set theme for domain
router.put('/:domain/theme', ({params: {domain}, body}, res) => {
    validate.theme(body);
    const themeInput : Theme = body;
    const dom = getDomain(parseInt(domain));

    let theme;
    if(typeof dom.theme == 'undefined') {
        theme = createTheme(themeInput);
        dom.theme = theme.id;
        updateDomain(dom.id as number, dom);
    } else {
        theme = updateTheme(dom.theme, themeInput);
    }

    res.json(theme);
});

//submit entry score
router.post('/:domain/answer/:entry', ({params: {domain, entry}, body, user}, res) => {
    validateLogin(user);

    const dom = getDomain(parseInt(domain));

    if(dom.disableScoring) {
        throw new APIError('scoring is disabled', 403);
    }

    validate.answer(body);
    const answer: Answer = body;
    if (answer.entry != parseInt(entry)) {
        throw new APIError('answer entry id does not match path');
    }
    if (!user || answer.user != user.id) {
        throw new APIError('answer user id does not match logged in user');
    }
    res.json(setAnswer(answer));
});

router.get('/:domain/answers/:entry', ({params: {domain, entry}, user}, res) => {
    validateLogin(user);
    const ent = getEntry(parseInt(entry));

    if(!ent) {
        throw new APIError(`entry '${entry}' not found`, 404);
    }

    if(ent.domain !== parseInt(domain)) {
        throw new APIError(`entry '${entry}' unknown for domain '${domain}'`, 404);
    }

    res.json(getAnswers(user?.id as number, parseInt(entry)));
})

//get scores
router.get('/:domain/scores', ({params: {domain}}, res) => {
    const finalEntries = getDomainAnswers(parseInt(domain));
    const finalDomain = getDomain(parseInt(domain));

    if (!finalDomain.showResults) {
        throw new APIError('show results is not enabled', 403);
    }

    const scores = finalEntries.map(entry => {
        const userIds = entry.answers?.reduce((acc: number[], fEntry) => {
            return [
                ...acc,
                fEntry.user
            ]
        }, []);

        const scorers = new Set(userIds).size;

        const byRank = entry?.answers?.reduce((acc: {[k: string]: number}, answer) => {
            return {
                ...acc,
                [`r${answer.rank}`]: (acc[`r${answer.rank}`] || 0) + answer.value
            }
        }, {});

        const ranks = finalDomain.ranks.reduce((acc, rank, index) => {
            return {
                ...acc,
                [rank.name]: (byRank?.[`r${index}`] || 0) / scorers
            };
        }, {});

        return {
            entry: entry,
            scorers: scorers,
            byRank,
            scores: {
                overall: Object.values(ranks).reduce((acc: number, val) => acc + (val as number), 0),
                ...ranks
            }
        }
    });

    res.json(scores.sort((a, b) => b.scores.overall - a.scores.overall));
});

export default router;