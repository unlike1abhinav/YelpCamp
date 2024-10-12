const mongoose = require("mongoose");
const cities = require('./cities.js');
const { places, descriptors } = require('./seedhelpers');
const Campground = require('../models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/yelpCampground')
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch(() => {
        console.log("Mongo Error")
    })

const sample = (array) => array[Math.floor(Math.random() * (array.length))]

const seedDB = async (request, response) => {
    await Campground.deleteMany({});
    for (let index = 0; index < 50; index++) {
        const random = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*15000)
        const camp = new Campground({
            location: `${cities[random].city}, ${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image : 'https://picsum.photos/500/400',
            description: 'This is description for Campground',
            price : price 
        })
        await camp.save();
    }
}

seedDB()
    .then(() => {
        console.log("Seeding complete!");
    })
    .catch((err) => {
        console.error("Error during seeding:", err);
    })
    .finally(() => {
        mongoose.connection.close();
    });