const express = require('express');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser')

dotenv.config();
const Car = require('./models/carModel')

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());



app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Connect to MongoDB
mongoose.connect("mongodb+srv://user:user@cluster0.hevjgko.mongodb.net/?retryWrites=true&w=majority");
const db = mongoose.connection;

db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));


//addcars route
app.post('/api/upload', async (req, res) => {
  try {
    const { name, images, carnumber, km, owners, fueltype, registrationYear, rto, color, mileage } = req.body;

    // Create a new instance of the Car model
    const newCar = new Car({
      name,
      images,
      carnumber,
      km,
      owners,
      fueltype,
      registrationYear,
      rto,
      color,
      mileage
    });

    // Save the new car to the database
    const savedCar = await newCar.save();

    // Respond with the saved car details
    res.json(savedCar);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading car details' });
  }
});


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

