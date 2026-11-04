import express from 'express';
import { sanitizeFilter } from 'mongoose';
import Location from '../models/supplies/location.js';


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

router.post('/locations', function(req, res) {
    const createLocation = async (name) => {
        const loc = new Location({name: name});
        try {
            await loc.save();
        } catch (err) {
            console.log(`Unable to create Location ${name}: ${err}`);
        }
    };

    createLocation('Desk gray shelf top');
    createLocation('Desk gray shelf middle');
    createLocation('Desk gray shelf bottom');
});

export default router;