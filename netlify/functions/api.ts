
import express, { Router } from "express";
import serverless from "serverless-http";

const app = express();
const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));

// const corsOptions = {
//     origin: ["https://retro-rating-app.netlify.app/"],
//     optionsSuccessStatus: 200 // For legacy browser support
// }
// app.use(cors(corsOptions))

// copy pasta below
app.locals.score = {serverThumbsUp: 0, serverThumbsDown: 0};
app.locals.currentVoters = new Set();
app.locals.currentHost = [];

// respond with "hello world" when a GET request is made to the homepage
router.get('/participant', (req, res) => {
    if (app.locals.currentHost.length !== 1) {
        console.log("score", app.locals.score)
        console.log("currentVoters", app.locals.currentVoters)
        console.log("app.locals.currentHost", app.locals.currentHost)
        console.log("thumbs up", +req.query?.thumbsUp)
        console.log("thumbs down", +req.query?.thumbsDown)
        console.log("user", req.query?.user)
        return res.send(app.locals.score);
    }
    if (+req.query.thumbsUp === 1 && !app.locals.currentVoters.has(req.query?.user)) {
        app.locals.score.serverThumbsUp++;
        app.locals.currentVoters.add(req.query?.user)
    } else if (+req.query.thumbsDown === 1 && !app.locals.currentVoters.has(req.query?.user)) {
        app.locals.score.serverThumbsDown++;
        app.locals.currentVoters.add(req.query?.user)
    } else if (+req.query.thumbsUp === 1 && app.locals.currentVoters.has(req.query?.user)) {
        app.locals.score.serverThumbsUp++;
        app.locals.score.serverThumbsDown--;
    } else if (+req.query.thumbsDown === 1 && app.locals.currentVoters.has(req.query?.user)) {
        app.locals.score.serverThumbsDown++;
        app.locals.score.serverThumbsUp--;
    }
    console.log("app.locals.score", app.locals.score)
    console.log("app.locals.currentVoters", app.locals.currentVoters)
    console.log("app.locals.currentHost", app.locals.currentHost)
    console.log("thumbs up", +req.query?.thumbsUp)
    console.log("thumbs down", +req.query?.thumbsDown)
    console.log("user", req.query?.user)
    res.send(app.locals.score)
})
router.get('/admin', (req, res) => {
    if (app.locals.currentHost.length === 0 && !req.query?.reset) {
        app.locals.currentHost = [req.query?.user]
        // bug happened
    } else if (app.locals.currentHost.length > 1) {
        app.locals.currentHost = [];
    }
    if (app.locals.currentHost?.[0] === req.query?.user && req.query?.reset === "true") {
        app.locals.currentHost = [];
        app.locals.currentVoters = new Set();
        app.locals.score.serverThumbsDown = 0;
        app.locals.score.serverThumbsUp = 0;
    }

    res.send(req.query.reset)
})

app.use("/api/", router);
export const handler = serverless(app);
