import mongoose from '../connect.js';
import Category from '../supplies/category.js';

async function createCategory(name) {
    const cat = new Category({name: name});
    try {
        await cat.save();
    } catch (err) {
        console.log(`Unable to save Category ${name}: ${err}`);
    }
}

createCategory('Papercrafting');
createCategory('Inking');
createCategory('Painting');
createCategory('Fabric Crafts');