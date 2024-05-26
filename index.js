// const mongoose = require('mongoose');
// const express = require('express');
// const Event = require('./schema.js');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// app.use(bodyParser.json());
// app.use(cors());

// async function connectToDb() {
//   try {
//     await mongoose.connect('mongodb+srv://amruta:vieFC9VXxVSgoPzM@cluster0.rgbuaxs.mongodb.net/EventManagement?retryWrites=true&w=majority&appName=Cluster0');
//     console.log('DB Connection established');
//     const port = process.env.PORT || 8002;
//     app.listen(port, function() {
//         console.log(`Listening on port ${port}`);
//     });
//   } catch (error) {
//     console.log(error);
//     console.log("Couldn't establish connection");
//   }
// }

// connectToDb();

// app.post('/add-event', async function (request, response) {
//     try {
//         const newEvent = await Event.create({
//             title: request.body.title,
//             category: request.body.category,
//             date: request.body.date,
//             imageUrl: request.body.imageUrl
//         });
//         response.status(201).json({
//             status: 'success',
//             message: 'Event created successfully',
//             event: newEvent
//         });
//     } catch (error) {
//         console.error('Error creating event:', error);
//         response.status(500).json({
//             status: 'failure',
//             message: 'Failed to create event',
//             error: error.message
//         });
//     }
// });

// app.get('/req-event', async function (request, response) {
//     try {
//         const { category } = request.query;
//         const query = category ? { category } : {}; // Adjust query based on the presence of category
//         const events = await Event.find(query);
//         response.status(200).json(events);
//     } catch (error) {
//         console.error('Error fetching events:', error);
//         response.status(500).json({
//             status: 'failure',
//             message: 'Failed to fetch events',
//             error: error.message
//         });
//     }
// });

// module.exports = app;

const mongoose = require('mongoose');
const express = require('express');
const { Event, EventDescription } = require('./schema.js'); // Import both models
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Create the Event
        const newEvent = new Event({
            title: request.body.title,
            category: request.body.category,
            date: request.body.date,
            imageUrl: request.body.imageUrl
        });
        await newEvent.save({ session });

        // Create the EventDescription and link it to the Event
        const newEventDescription = new EventDescription({
            event: newEvent._id,
            imageUrl: request.body.imageUrl,
            time: request.body.time,
            mode: request.body.mode,
            about: request.body.about,
            termsAndConditions: request.body.termsAndConditions
        });
        await newEventDescription.save({ session });

        await session.commitTransaction();
        session.endSession();

        response.status(201).json({
            status: 'success',
            message: 'Event and description created successfully',
            event: newEvent,
            eventDescription: newEventDescription
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
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
        const query = category ? { category } : {}; // Adjust query based on the presence of category
        const events = await Event.find(query).populate('description');
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

module.exports = app;


