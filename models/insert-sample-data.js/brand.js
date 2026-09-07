import mongoose from '../connect.js';
import Brand from '../brand.js';

async function createBrand(name, description) {
    const brand = new Brand({name: name, description: description});
    await brand.save();
}

await createBrand("Winsor & Newton", "Quality products of ink, paint brushes, watercolor, and so on.");