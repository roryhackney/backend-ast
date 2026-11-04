import Location from '../supplies/location';

async function createLocation(name) {
    const loc = new Location({name: name});
    try {
        await loc.save();
    } catch (err) {
        console.log(`Unable to create Location ${name}: ${err}`);
    }
}

createLocation('Desk gray shelf top');
createLocation('Desk gray shelf middle');
createLocation('Desk gray shelf bottom');