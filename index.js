const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const Event = require('./schema.js');
const Eventdes = require('./schemaEvent.js');
const Cart = require('./myevents.js');
const UserEvent = require('./schemaUserEvent.js');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Ensure the uploads directory exists
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

async function connectToDb() {
    try {
        await mongoose.connect('mongodb+srv://amruta:vieFC9VXxVSgoPzM@cluster0.rgbuaxs.mongodb.net/EventManagement?retryWrites=true&w=majority&appName=Cluster0');
        console.log('DB Connection established');
        const port = process.env.PORT || 8002;
        app.listen(port, function() {
            console.log(`Listening on port ${port}`);
        });
    } catch (error) {
        console.log(error);
        console.log("Couldn't establish connection");
    }
}

connectToDb();

app.post('/add-event', async function (request, response) {
    try {
        const newEvent = await Event.create({
            title: request.body.title,
            category: request.body.category,
            date: request.body.date,
            imageUrl: request.body.imageUrl,
            detailedEventId: request.body.detailedEventId 
        });
        response.status(201).json({
            status: 'success',
            message: 'Event created successfully',
            event: newEvent
        });
    } catch (error) {
        console.error('Error creating event:', error);
        response.status(500).json({
            status: 'failure',
            message: 'Failed to create event',
            error: error.message
        });
    }
});

app.get('/req-event', async function (request, response) {
    try {
        const { category } = request.query;
        const query = category ? { category } : {}; 
        const events = await Event.find(query).populate('detailedEventId');
        response.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        response.status(500).json({
            status: 'failure',
            message: 'Failed to fetch events',
            error: error.message
        });
    }
});

app.post('/add-eventdes', async function (request, response) {
    try {
        const newEventDes = await Eventdes.create({
            title: request.body.title,
            category: request.body.category,
            date: request.body.date,
            imageUrl: request.body.imageUrl,
            about: request.body.about,
            termsAndConditions: request.body.termsAndConditions,
            mode: request.body.mode,
            time: request.body.time,
            location: request.body.location
        });
        response.status(201).json({
            status: 'success',
            message: 'Event Description added successfully',
            event: newEventDes
        });
    } catch (error) {
        console.error('Error creating event description:', error);
        response.status(500).json({
            status: 'failure',
            message: 'Failed to create event description',
            error: error.message
        });
    }
});

app.get('/eventdes/:id', async function (request, response) {
    try {
        const id = request.params.id.trim(); 
        console.log(`Fetching event description with ID: ${id}`); 
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`Invalid ObjectId: ${id}`);
            return response.status(400).json({
                status: 'failure',
                message: 'Invalid Event Description ID'
            });
        }

        const eventDes = await Eventdes.findById(id);
        if (!eventDes) {
            console.log(`Event description with ID ${id} not found`); 
            return response.status(404).json({
                status: 'failure',
                message: 'Event description not found'
            });
        }
        response.status(200).json(eventDes);
    } catch (error) {
        console.error(`Error fetching event description with ID ${id}:`, error);
        response.status(500).json({
            status: 'failure',
            message: 'Failed to fetch event description',
            error: error.message
        });
    }
});

app.post('/cart', (req, res) => {
    const { username, image, title, date, category, imageUrl } = req.body;

    const newCartItem = new Cart({ username, image, title, date, category, imageUrl });

    newCartItem.save()
        .then(item => res.status(201).json(item))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/getcart', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const carts = await Cart.find({ username });
        res.json(carts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/add-user-event', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const newUserEvent = await UserEvent.create({ ...req.body, imageUrl });
    res.status(201).json(newUserEvent);
  } catch (error) {
    console.error('Error creating user event:', error);
    res.status(500).json({ error: 'Failed to create user event' });
  }
});

app.put('/user-events/:id', upload.single('image'), async (req, res) => {
    try {
      const { id } = req.params;
      const event = await UserEvent.findById(id);
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      // Check if a new image file was uploaded
      if (req.file) {
        // Construct the new imageUrl
        const newImageUrl = `/uploads/${req.file.filename}`;
        
        // Remove the previous image file if it exists
        if (event.imageUrl) {
          // Delete the previous image file from the server
          const previousImagePath = path.join(__dirname, event.imageUrl);
          fs.unlinkSync(previousImagePath);
        }
  
        // Update the imageUrl with the new path
        event.imageUrl = newImageUrl;
      }
  
      // Update other fields if necessary
      // Example:
      // event.title = req.body.title;
      // event.description = req.body.description;
      // ...
  
      // Save the updated event
      await event.save();
  
      // Respond with the updated event
      res.status(200).json(event);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  });
  
  // GET route to fetch user events
  app.get('/user-events', async (req, res) => {
    try {
      const { username } = req.query;
      if (!username) {
          return res.status(400).json({ error: 'Username is required' });
      }
  
      const userEvents = await UserEvent.find({ username });
      res.json(userEvents);
    } catch (error) {
      console.error('Error fetching user events:', error);
      res.status(500).json({ error: 'Failed to fetch user events' });
    }
  });
  
  module.exports = app;
  