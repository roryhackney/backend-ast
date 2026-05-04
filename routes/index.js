import express from 'express';
const router = express.Router();

router.get('/', function(req, res, next) {
    res.status(200).render('index', { title: 'Express' });
});

router.get("/test-api", function(req, res) {
    const results = {test: "This is an API test", timestamp: new Date().toISOString()};
    res.status(200).json(results);
});

router.get("/secure-api", function(req, res) {
    if (! req?.cookies?.token) {
        res.status(401).send();
    } else {
        res.status(200).json({"superSecret": req.cookies.token});
    }
});

router.post("/login", function(req, res) {
    const user = req?.body?.username;
    const pass = req?.body?.password;
    if (user && pass &&
        user === process.env.ADMIN_USERNAME && 
        pass === process.env.ADMIN_PASSWORD) {
        //TODO:
        //generate a token
        //set the cookie to remember the token
        //put the token into the db, overwriting current session token
        //invalidate other logins, deleting cookies?
        //on navigating to page, if the cookie does not match db token, delete it and make them log in again
        res.writeHead(200, {
            "Set-Cookie": "token=encryptedstring; HttpOnly",
            "Access-Control-Allow-Credentials": "true"
        }).send();
    } else {
        res.status(401).send();
    }
});

export default router;
