import express from 'express';
import { 
    check2FA, 
    checkLoggedInToken, 
    checkLogin,
    deleteExpired,
    deleteSession,
    generateSessionToken, 
    hasIPRateLimitBeenReached,
    minutes, 
    send2FA, 
    storeSession 
} from '../helpers/security.js';

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
    const sendEmails = req?.body?.actuallySendEmails === false ? false : true;
    const user = req?.body?.username;
    const pass = req?.body?.password;
    if (checkLogin(user, pass)) {
        const code = await send2FA(sendEmails);
        if (code != -1) res.status(200).json({code: code}).send();
        else res.status(500).send();
    } else {
        res.status(401).send();
    }
});

//step 2: verify 2FA, set cookie if success
router.post("/verify2FA", async function(req, res) {
    const sendEmails = req?.body?.actuallySendEmails === false ? false : true;

    const code = req?.body?.code;
    if (! code) {
        return res.status(401).json({"err": "No code sent"}).send();
    }
    const result = await check2FA(code);
    if (! result) return res.status(401).json({"err": "check2FA returned false"}).send();

    //generate token
    const token = generateSessionToken();

    //store token in sessions table
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ONE_DAY = minutes(1) * 60 * 24;
    const sessResult = await storeSession(token, ONE_DAY, ip, sendEmails);
    if (! sessResult) return res.status(500).send();

    //set cookie locally
    res.cookie("token", token, {httpOnly: true, secure: true}).send();
});

//step 3: check cookie, allow access if success
router.get("/verifySession", async function(req, res) {
    const token = req.cookies?.token;
    if (! token) return res.status(401).send({"err": "no token in cookies:" + JSON.stringify(req.cookies)});
    const result = await checkLoggedInToken(token);
    if (result) {
        res.status(200).send();
    } else {
        res.status(401).send();
    }
});

router.get("/logout", function(req, res) {
    const token = req.cookies?.token;
    if (token) {
        res.clearCookie("token", token, {httpOnly: true, secure: true});
        deleteSession(token);
        res.status(200).send();
    } else {
        res.status(401).send();
    }
});

router.get("deleteExpiredSessionsAnd2FAs", (req, res) => {
    deleteExpired();
    res.status(200).send();
});
    
export default router;
