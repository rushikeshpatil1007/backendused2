const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs'); // Import the 'fs' module
dotenv.config();
const Car = require('./models/carModel')


const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up a storage engine for multer to upload files to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// get all cars data
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    console.error('Error fetching car data:', error);
    res.status(500).json({ error: 'An error occurred while fetching car data.' });
  }
});
//get details on id 
app.get('/api/cars/:id', async (req, res) => {
  const carId = req.params.id;

  try {
    const car = await Car.findById(carId);
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ error: 'Car not found' });
    }
  } catch (error) {
    console.error('Error fetching car details:', error);
    res.status(500).json({ error: 'An error occurred while fetching car details.' });
  }
});
// Create an endpoint to handle the car form submission
app.post('/api/addCar', upload.array('images', 15), async (req, res) => {
  try {
    const carDetails = {
      name: req.body.name,
      km: req.body.km,
      carnumber: req.body.carnumber,
      owners: req.body.owners,
      fuelType: req.body.fuelType,
      registrationYear: req.body.registrationYear,
      mileage: req.body.mileage,
      rto: req.body.rto,
      color: req.body.color,
      price: req.body.price,
      images: [],
    };

    // Upload images to Cloudinary
    for (const file of req.files) {
      // Temporarily save the file to the server's local file system
      const tempFilePath = `/${file.originalname}`;
      fs.writeFileSync(tempFilePath, file.buffer);

      const result = await cloudinary.uploader.upload(tempFilePath);
      carDetails.images.push(result.secure_url);

      // Delete the temporary file after uploading to Cloudinary
      fs.unlinkSync(tempFilePath);
    }

    // Create a new car document in MongoDB
    const newCar = new Car(carDetails);
    const savedCar = await newCar.save();

    res.json(savedCar);
  } catch (error) {
    console.error('Error uploading car details and images.', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});


// get all cars for admin 
app.get('/api/allcars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
//delete cars for admin
app.delete('/api/allcars/:id', async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    res.json(deletedCar);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
