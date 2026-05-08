import connect from '../connect.js';
import Brand from '../brand.js';

await connect();

await createBrand("Winsor & Newton", "Quality products of ink, paint brushes, watercolor, and so on.");
console.log("Added successfully");

async function createBrand(name, description) {
    console.log("Adding");
    const brand = new Brand({name: name, description: description});
    await brand.save();
}
