
import { Router } from "express";
import serverless from "serverless-http";
import {createRequire} from 'module';

const require = createRequire(import.meta.url);
// const cors = require('cors'); // not on the server

const express = require('express')
const api = express();

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));

api.use("/api/", router);

export const handler = serverless(api);
