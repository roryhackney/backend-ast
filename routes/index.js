import express from 'express';
const router = express.Router();

const authenticate = (username, password) => {
    return {"success": username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD};
}

router.get('/', function(req, res, next) {
    res.status(200).render('index', { title: 'Express' });
});

router.get("/test-api", function(req, res) {
    const results = {test: "This is an API test", timestamp: new Date().toISOString()};
    res.status(200).json(results);
});

router.get("/secure-api", function(req, res) {
    if (!req.cookies.token) {
        res.status(401).send();
    } else {
        res.json({"superSecret": req.cookies.token});
    }
})

router.post("/login", function(req, res) {
    if (req.body === undefined || req.body.name === undefined || req.body.password === undefined) {
        res.json({success: false});
    } else {
        const result = authenticate(req.body.name, req.body.password);
        if (result.success) {
            //generate a token
            //set the cookie to remember the token
            //put the token into the db, overwriting current token
            //invalidate other logins, deleting cookies?
            res.writeHead(200, "oh boy login time", {
                "Set-Cookie": "token=encryptedstring; HttpOnly",
                "Access-Control-Allow-Credentials": "true"
            }).send();
        } else {
            res.json(result);
        }
    }
});

export default router;
