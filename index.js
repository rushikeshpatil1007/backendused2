const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser')

dotenv.config();
const Car = require('./models/carModel')
const User = require('./models/User')
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());



app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));


//addcars route
app.post('/api/upload', async (req, res) => {
  try {
    const { name, images, carnumber, km, owners, fuelType, registrationYear, rto, color, mileage, price } = req.body;

    // Create a new instance of the Car model
    const newCar = new Car({
      name,
      images,
      carnumber,
      km,
      owners,
      fuelType,
      price,
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


// using send otp check for 

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to the provided email
const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAILSEND,
      pass: process.env.PASSWORDS,
    },
  });

  const mailOptions = {
    from: 'patilrushikesh1007@gmail.com',
    to: email,
    subject: 'Verification OTP',
    text: `Your OTP is ${otp}.`,
  };

  try {

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};




// Route to send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    const otp = generateOTP();
    user.otp = otp;
    await user.save();

    try {
      await sendOTP(email, otp);
      res.json({ success: true, message: 'OTP sent successfully.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
  } else {
    res.status(404).json({ success: false, message: 'User not found.' });
  }
});


// Route to verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && user.otp === otp) {
      // Clear the OTP after successful verification
      user.otp = '';
      await user.save();

      res.json({ success: true, message: 'OTP verification successful.' });
    } else {
      res.status(401).json({ success: false, message: 'OTP verification failed. Invalid OTP.' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});









































app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

