const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const cors = require('cors')
const app = express();
const PORT = 8080;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB connected');
});

const requestRouter = require('./routes/requests');
app.use('/api/requests', requestRouter);

app.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});
