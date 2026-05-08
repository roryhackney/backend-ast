import express from 'express';
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    res.send('respond with a resource');
});

router.get('/cool', function(req, res) {
    res.send("You are so cool!");
});

export default router;
