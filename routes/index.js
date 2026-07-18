import express from 'express';
import { check2FA, checkLoggedInToken, checkLogin, hasIPRateLimitBeenReached, minutes, send2FA, storeSession } from '../helpers/security';
import {randomBytes} from 'node:crypto';

const router = express.Router();

router.get("/secure-api", async function(req, res) {
    if (! req?.cookies?.token) {
        res.status(401).send();
    } else {
        const authorized = await checkLoggedInToken(req.cookies.token);
        if (! authorized) res.status(401).send();
        else res.status(200).send();
    }
});

//step 1: check login, send/store 2FA if success
router.post("/login", async function(req, res) {
    const user = req?.body?.username;
    const pass = req?.body?.password;
    if (checkLogin(user, pass)) {
        const result = await send2FA();
        if (result) res.status(200).send();
        else res.status(500).send();
    } else {
        res.status(401).send();
    }
});

//step 2: verify 2FA, set cookie if success
router.post("/verify2FA", async function(req, res) {
    const code = req?.body?.code;
    if (! code) return res.status(401).send();

    const result = await check2FA(code, minutes(10));
    if (! result) return res.status(401).send();

    //generate token
    const LENGTH = 32;
    const token = randomBytes(LENGTH).toString('hex').slice(0, LENGTH);

    //store token in sessions table
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ONE_DAY = minutes(1) * 60 * 24;
    const sessResult = await storeSession(token, ONE_DAY, ip);
    if (! sessResult) return res.status(500).send();

    //set cookie locally
    res.writeHead(200, {
        "Set-Cookie": `token=${token}; HttpOnly; Secure;`,
        "Access-Control-Allow-Credentials": "true"
    }).send();
});

//step 3: check cookie, allow access if success
router.get("/verifySession", async function(req, res) {
    const token = req.cookies?.token;
    if (! token) return res.status(401).send();
    const result = await checkLoggedInToken(token);
    if (result) {
        res.status(200).send();
    } else {
        res.status(401).send();
    }
});

export default router;
