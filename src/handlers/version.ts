// @ts-ignore
import pkg from "../../package.json";
import {Router} from "express";

const router = Router();

router.get('/', (req, res) => {
    res.json({
        status: 'online',
        version: pkg.version
    })
});

export default router;