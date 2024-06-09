const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const UserEvent = require('./schemaUserEvent.js');
const Event = require('./schema.js');
const Eventdes = require('./schemaEvent.js');
const Cart = require('./myevents.js');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Ensure the 'uploads' directory exists and has the correct permissions
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use only the original filename
    }
});

const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// Connect to MongoDB
async function connectToDb() {
    try {
        await mongoose.connect('mongodb+srv://amruta:vieFC9VXxVSgoPzM@cluster0.rgbuaxs.mongodb.net/EventManagement?retryWrites=true&w=majority&appName=Cluster0');
        console.log('DB Connection established');
        const port = process.env.PORT || 8002;
        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });
    } catch (error) {
        console.error(error);
        console.log("Couldn't establish connection");
    }
}

connectToDb();

// Create event endpoint
app.post('/add-event', async (req, res) => {
    try {
        const newEvent = await Event.create(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Event created successfully',
            event: newEvent
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            status: 'failure',
            message: 'Failed to create event',
            error: error.message
        });
    }
});

// Fetch events endpoint
app.get('/req-event', async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category } : {}; 
        const events = await Event.find(query).populate('detailedEventId');
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            status: 'failure',
            message: 'Failed to fetch events',
            error: error.message
        });
    }
});

// Create event description endpoint
app.post('/add-eventdes', async (req, res) => {
    try {
        const newEventDes = await Eventdes.create(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Event Description added successfully',
            event: newEventDes
        });
    } catch (error) {
        console.error('Error creating event description:', error);
        res.status(500).json({
            status: 'failure',
            message: 'Failed to create event description',
            error: error.message
        });
    }
});

// Fetch event description by ID endpoint
app.get('/eventdes/:id', async (req, res) => {
    try {
        const id = req.params.id.trim(); 
        console.log(`Fetching event description with ID: ${id}`); 
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`Invalid ObjectId: ${id}`);
            return res.status(400).json({
                status: 'failure',
                message: 'Invalid Event Description ID'
            });
        }

        const eventDes = await Eventdes.findById(id);
        if (!eventDes) {
            console.log(`Event description with ID ${id} not found`); 
            return res.status(404).json({
                status: 'failure',
                message: 'Event description not found'
            });
        }
        res.status(200).json(eventDes);
    } catch (error) {
        console.error(`Error fetching event description with ID ${id}:`, error);
        res.status(500).json({
            status: 'failure',
            message: 'Failed to fetch event description',
            error: error.message
        });
    }
});

// Add item to cart endpoint
app.post('/cart', async (req, res) => {
    try {
        const newCartItem = await Cart.create(req.body);
        res.status(201).json(newCartItem);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// Fetch cart items endpoint
app.get('/getcart', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        const carts = await Cart.find({ username });
        res.json(carts);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }
});

// Create user event endpoint with file upload
app.post('/add-user-event', upload.single('image'), async (req, res) => {
    try {
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const newUserEvent = await UserEvent.create({
            ...req.body,
            imageUrl: fileUrl
        });
        res.status(201).json(newUserEvent);
    } catch (error) {
        console.error('Error creating user event:', error);
        res.status(500).json({ error: 'Failed to create user event' });
    }
});

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

// Update user event endpoint with file upload
app.put('/user-events/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const updatedEvent = req.body;
        if (req.file) {
            updatedEvent.imageUrl = `/uploads/${req.file.filename}`;
        }
        const event = await UserEvent.findByIdAndUpdate(id, updatedEvent, { new: true });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete user event endpoint
app.delete('/user-events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await UserEvent.findByIdAndDelete(id);
        if (!deletedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = app;
