import express, { Router } from "express";
import * as Path from "path";

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = Path.dirname(__filename)

const router = Router();

router.use(express.static(Path.resolve(__dirname, '../public/app')));

export default router;