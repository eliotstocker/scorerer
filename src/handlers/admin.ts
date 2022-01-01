import express, { Router } from "express";
import * as Path from "path";
import UIError from "../errors/UIError";

import { fileURLToPath } from 'url';
import {getUsers} from "../database";
const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

const router = Router();

//check if user is admin
router.use((req, res, next) => {
    const users = getUsers();

    if((!req.user || !req.user.isAdmin) && users.length > 0) {
        throw new UIError('You are not permitted to view this section');
    }
    next();
});

router.use(express.static(Path.resolve(__dirname, '../public/admin')));

export default router;