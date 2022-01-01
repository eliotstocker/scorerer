import express from "express";
import APIError from "../errors/APIError";
import UIError from "../errors/UIError";
import ValidationError from "../errors/ValidationError";

export default function (err: Error, req: express.Request, res: express.Response, next: Function) {
    if (res.headersSent) {
        return next(err)
    }

    if (err instanceof APIError) {
        res.status(err.code);
        return res.json({error: err.message});
    }

    if(err instanceof ValidationError) {
        res.status(422);
        return res.json({error: err.message});
    }

    if (err instanceof UIError) {
        res.status(err.code);
        return res.send(`<html lang="en"><head><title>App Error</title></head><body><h1>App Error (${err.code})</h1><h2>${err.message}</h2></body></html>`);
    }

    res.status(500);
    res.json({error: err.message});
}