
import express, { Router } from "express";
import serverless from "serverless-http";
import cors from "cors";

const app = express()
const router = Router();

router.get("/hello", (req, res) => res.send("Hello World!"));

const corsOptions = {
    origin: ["https://retro-rating-app.netlify.app/"],
    optionsSuccessStatus: 200 // For legacy browser support
}
app.use(cors(corsOptions))
// copy pasta below
app.locals.score = {serverThumbsUp: 0, serverThumbsDown: 0};
app.locals.currentVoters = new Set();
app.locals.currentHost = [];

app.locals.sessions = { }

// respond with "hello world" when a GET request is made to the homepage
router.get('/participant', (req, res) => {
    // start
    if (!app?.locals?.sessions?.[req.query?.session]) {
        app.locals.sessions = {
            ...app.locals.sessions,
            [req.query?.session ]: { score: { serverThumbsDown: 0, serverThumbsUp: 0}, currentVoters: new Set(), currentHost: [req.query?.user] } };
    }
    const currentSession = app?.locals?.sessions[req.query?.session];
    if (+req.query.thumbsUp === 1 && !currentSession?.currentVoters.has(req.query?.user)) {
        currentSession.score.serverThumbsUp++;
        currentSession.currentVoters.add(req.query?.user)
    } else if (+req.query.thumbsDown === 1 && !currentSession?.currentVoters.has(req.query?.user)) {
        currentSession.score.serverThumbsDown++;
        currentSession.currentVoters.add(req.query?.user)
    } else if (+req.query.thumbsUp === 1 && currentSession?.currentVoters.has(req.query?.user)) {
        currentSession.score.serverThumbsUp++;
        currentSession.score.serverThumbsDown--;
    } else if (+req.query.thumbsDown === 1 && currentSession?.currentVoters.has(req.query?.user)) {
        currentSession.score.serverThumbsDown++;
        currentSession.score.serverThumbsUp--;
    }
    console.log("app.locals.score", app.locals.score)
    console.log("app.locals.currentVoters", app.locals.currentVoters)
    console.log("app.locals.currentHost", app.locals.currentHost)
    console.log("thumbs up", +req.query?.thumbsUp)
    console.log("thumbs down", +req.query?.thumbsDown)
    console.log("user", req.query?.user)
    console.log('session', req.query.session)
    console.log('session', currentSession)
    res.send(currentSession.score)
})
router.get('/admin', (req, res) => {
    // start
    if (!app?.locals?.sessions?.[req.query?.session]) {
        app.locals.sessions = {
            ...app.locals.sessions,
            [req.query?.session]: { score: { serverThumbsDown: 0, serverThumbsUp: 0}, currentVoters: new Set(), currentHost: [req.query?.user] } };
    }
    const currentSession = app?.locals?.sessions[req.query?.session];
    if (currentSession?.currentHost?.[0] === req.query?.user && req.query?.reset === "true") {
        // currentSession.currentHost = [];
        currentSession.currentVoters = new Set();
        currentSession.score.serverThumbsDown = 0;
        currentSession.score.serverThumbsUp = 0;
    }

    console.log("app.locals.score", app.locals.score)
    console.log("app.locals.currentVoters", app.locals.currentVoters)
    console.log("app.locals.currentHost", app.locals.currentHost)
    console.log("thumbs up", +req.query?.thumbsUp)
    console.log("thumbs down", +req.query?.thumbsDown)
    console.log("user", req.query?.user)
    console.log('session', req.query.session)
    console.log('session', app.locals.sessions)

    res.send(req.query.reset)
})
app.use("/app/", router);
export const handler = serverless(app);
