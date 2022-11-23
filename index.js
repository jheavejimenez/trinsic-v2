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
const credentialRouter = require('./routes/credentials');
const walletRouter = require('./routes/wallet');
const verifyRouter = require('./routes/verify');

app.use('/api/requests', requestRouter);
app.use('/api/credential-schemas', credentialRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/verify',verifyRouter);

app.get('/api/endpoints', (req, res) => {
    res.send(
        `
        <h1>API Endpoints</h1>
        <ul>
            <li>GET /api/requests</li>
            <li>GET /api/requests/check-revocation-status?crendentialId=urn credential status id</li>
            <li>POST /api/requests</li>
            <li>PUT /api/requests/:id/issue</li>
            <li>PUT /api/requests/revoke</li>
            <li>GET /api/credential-schemas</li>
            <li>GET /api/credential-schemas/check</li>
            <li>GET /api/credential-schemas/generate-id</li>
            <li>POST /api/credential-schemas</li>
            <li>GET /api/wallet?email=user email</li>
            <li>POST /api/wallet/create-account</li>
            <li>PUT /api/wallet/confirm-account</li>
            <li>GET /api/verify</li>
        </ul>
        `
    )
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
