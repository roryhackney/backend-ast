import connect from '../models/connect.js';
import Location from '../models/supplies/location.js';
import Category from '../models/supplies/category.js';

/**
 * Creates a Location and saves it in the databse
 * @param {String} name Name of the Location, must be unique
 * @returns true if successful, false if failed (due to duplicate name)
 */
const createLocation = async (name) => {
    const loc = new Location({name: name});
    try {
        await loc.save();
        return true;
    } catch {
        return false;
    }
};

/**
 * Creates a Category and saves it in the databse
 * @param {String} name Name of the Category, must be unique
 * @returns true if successful, false if failed (due to duplicate name)
 */
const createCategory = async (name) => {
    const cat = new Category({name: name});
    try {
        await cat.save();
        return true;
    } catch {
        return false;
    }
};

/**
 * Adds all names to the type of model, eg adds all names as locations
 * @param {string[]} names list of names to be added to the model type, must not be empty
 * @param {string} type name of the model, must be either location or category
 * @returns success status and message, either input validation or which names failed (could be none) for any reason
 */
export const rapidAdd = async (names, type) => {
    let status;
    if (typeof type === string) type = type.toLowercase().trim();
    if (! typeof names === 'array' || names.length === 0 || typeof names[0] !== 'string') {
        status = {"success": false, "message": "Names must be an array containing at least one string."};
    } else if (typeof type !== 'string' || ! type in ['location', 'category']) {
        status = {"success": false, "message": "Type must be either location or category."};
    } else {
        const failed = [];
        names.forEach(name => {
            if (typeof name !== 'string' || name.trim().length === 0) {
                failed.push(name);
            } else {
                const cleaned = name.trim();
                const success = type === 'location' ? await createLocation(cleaned) : await createCategory(cleaned);
                if (! success) failed.push(name);
            }
        });

        if (failed.length > 0) {
            if (failed.length < names.length) {
                status = {"success": true, "message": `Unable to save ${failed.length} of ${names.length} ${type}s: ${failed}`};
            } else {
                status = {"success": false, "message": `Unable to save all ${failed.length} ${type}s.`};
            }
        } else {
            status = {"success": true, "message": `Successfully saved all ${type}s.`};
        }
    }
    return status;
}