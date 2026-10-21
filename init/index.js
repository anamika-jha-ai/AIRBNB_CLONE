// const mongoose = require('mongoose');
// const initData = require('./data.js');
// const Listing = require('../models/listing.js');

// const MONGO_URL = 'mongodb://localhost:27017/AIRBNB';

// async function main (){
//     await mongoose.connect(MONGO_URL);
// }

// main().then(() => {
//     console.log('Connected to MongoDB');
// }).catch(err => {
//     console.error('Failed to connect to MongoDB', err);
// });

// const initDB = async () => {
//     await Listing.deleteMany({});
//    await Listing.insertMany(initData.data);
//    console.log('data was initialized');
// };
// initDB();


const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { data } = require("./data");

const MONGO_URL = "mongodb://127.0.0.1:27017/AIRBNB";

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(async () => {
    console.log("Connected to MongoDB");

    // 🔥 TRANSFORM DATA HERE
    const fixedData = data.map((item) => ({
      ...item,
      image: item.image.url,   // ← extract ONLY url
    }));

    await Listing.deleteMany({});
    const updatedData = fixedData.map((obj) => ({
      ...obj,
      owner: "69a71ad18f854e2ebc5b802c"
    }));
    await Listing.insertMany(updatedData);

    console.log("data was initialized");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log(err);
  }); 
