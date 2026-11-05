import express from 'express';
import { sanitizeFilter } from 'mongoose';
import { rapidAdd } from '../helpers/supplies';

const router = express.Router();

/* GET supplies listing. */
router.get('/', function(req, res) {
    res.send('respond with a resource');
});

router.get('/cool', function(req, res) {
    res.send("You are so cool!");
});

//Options
// - There are no locations
// - There are locations, return them alphabetically
// - There are no locations matching filter
// - There are locations matching filter, return them alphabetically
// - The filter is invalid or malicious, return err
router.get('/locations', async function(req, res) {
    let filter = req.query.filter;
    if (typeof filter === 'string') {
        filter = filter.trim();
        if (filter.length > 0) {
            try {
                filter = RegExp(filter);
                filter = sanitizeFilter({name: filter});
                const query = Location.find(filter).sort({name: 'asc'});
                const result = await query.exec();
                console.log("res", result);
                if (result && result.length > 0) {
                    const locations = result.map(item => item.name);
                    return res.status(200).send({locations: locations});
                } else {
                    return res.status(200).send({locations: `No locations found for ${req.query.filter}`});
                }
            } catch (err) {
                return res.status(400).send({error: `Invalid filter provided: ${err}`});
            }
        } else {
            return res.status(400).send({error: "Invalid filter provided"});
        }
    }
    const query = Location.find().sort({name: 'asc'});
    const result = await query.exec();
    if (result && result.length > 0) {
        const locations = result.map(item => item.name);
        return res.status(200).send({locations: locations});
    }
    return res.status(200).send({locations: 'No locations found.'});
});

router.post('/locations', async function(req, res) {
    const locations = req.body.locations;
    const status = await rapidAdd(locations, 'location');
    if (status.success) {
        res.status(200).json(status);
    } else {
        res.status(400).json(status);
    }
});

export default router;