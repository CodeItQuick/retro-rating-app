import express from "express";
// import serverless from "serverless-http";
import cors from "cors";

const app = express()

app.use(cors());

// app.use(cors(corsOptions))
// copy pasta below
app.locals.score = {serverThumbsUp: 0, serverThumbsDown: 0, serverPoopEmoji: 0};
app.locals.currentVoters = new Set();
app.locals.currentHost = [];

app.locals.sessions = {}

function participantEndpoint() {
    return (req, res) => {
        // start
        if (!app?.locals?.sessions?.[req.query?.session]) {
            app.locals.sessions = {
                ...app.locals.sessions,
                [req.query?.session]: {
                    score: {serverThumbsDown: 0, serverThumbsUp: 0, serverPoopEmoji: 0},
                    currentVoters: new Set(),
                    currentHost: [req.query?.user]
                }
            };
        }
        const currentSession = app?.locals?.sessions[req.query?.session];
        // const attachedUser = currentSession?.currentVoters.has(req.query?.user);
        const hasVoted = currentSession.currentVoters.has(req.query?.user);
        if (+req.query.thumbsUp === 1 && !hasVoted) {
            currentSession.score.serverThumbsUp++;
            currentSession.currentVoters.add(req.query?.user)
        } else if (+req.query.poopEmoji === 1 && !hasVoted) {
            currentSession.score.serverPoopEmoji++;
            currentSession.currentVoters.add(req.query?.user)
        } else if (+req.query.thumbsDown === 1 && !hasVoted) {
            currentSession.score.serverThumbsDown++;
            currentSession.currentVoters.add(req.query?.user)
        }
        console.log("app.locals.score", app.locals.score)
        console.log("app.locals.currentVoters", app.locals.currentVoters)
        console.log("app.locals.currentHost", app.locals.currentHost)
        console.log("thumbs up", +req.query?.thumbsUp)
        console.log("thumbs down", +req.query?.thumbsDown)
        console.log("user", req.query?.user)
        console.log('session', req.query.session)
        console.log('session', currentSession)
        console.log('hasVoted', hasVoted)
        console.log('applocals', app.locals)
        res.send(currentSession.score)
    };
}

function adminEndpoint() {
    return (req, res) => {
        // start
        if (!app?.locals?.sessions?.[req.query?.session]) {
            app.locals.sessions = {
                ...app.locals.sessions,
                [req.query?.session]: {
                    score: {serverThumbsDown: 0, serverThumbsUp: 0, serverPoopEmoji: 0},
                    currentVoters: new Set(),
                    currentHost: [req.query?.user]
                }
            };
        }
        const currentSession = app?.locals?.sessions[req.query?.session];
        if (currentSession?.currentHost?.[0] === req.query?.user && req.query?.reset === "true") {
            // currentSession.currentHost = [];
            currentSession.currentVoters = new Set();
            currentSession.score.serverThumbsDown = 0;
            currentSession.score.serverThumbsUp = 0;
            currentSession.score.serverPoopEmoji = 0;
        }

        console.log("app.locals.score", app.locals.score)
        console.log("app.locals.currentVoters", app.locals.currentVoters)
        console.log("app.locals.currentHost", app.locals.currentHost)
        console.log("thumbs up", +req.query?.thumbsUp)
        console.log("thumbs down", +req.query?.thumbsDown)
        console.log("user", req.query?.user)
        console.log('session', req.query.session)
        console.log('session', app.locals.sessions)

        res.send(currentSession.score)
    };
}

// respond with "hello world" when a GET request is made to the homepage

app.get("/api/participant", participantEndpoint());
app.get('/api/admin', adminEndpoint())

app.listen(8000);
