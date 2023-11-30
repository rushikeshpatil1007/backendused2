const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name: String,
    km: Number,
    carnumber: String,
    owners: Number,
    fuelType: String,
    registrationYear: Number,
    rto: String,
    mileage: String,
    color: String,
    price: String,
    images: [String], // store Cloudinary image URLs
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
