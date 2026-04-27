import express from 'express';
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/test-api", function(req, res) {
    const results = {test: "This is an API test", timestamp: new Date().toISOString()};
    res.json(results);
});

router.post("/login", function(req, res) {
    if (req.body === undefined) {
        res.json({success: false});
    } else {
        const name = req.body.name;
        const password = req.body.password;
        if (name && password && name === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            res.json({success: true});
        } else {
            res.json({success: false});
        }
    }
});

export default router;
