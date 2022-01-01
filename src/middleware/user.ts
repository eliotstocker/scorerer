import express from "express";
import {getUser} from "../database";

export default function (req: express.Request, res: express.Response, next: Function) {
    if (typeof req.signedCookies['__score_user'] != 'undefined') {
        req.user = getUser(req.signedCookies['__score_user']);
    }

    next();
}