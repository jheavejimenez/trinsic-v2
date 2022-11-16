const { TrinsicService, EcosystemInfoRequest } = require("@trinsic/trinsic");
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

async function getEcoSystemId() {
    const trinsic = new TrinsicService();

    trinsic.setAuthToken(process.env.AUTHTOKEN || "");

    const infoResponse = await trinsic
        .provider()
        .ecosystemInfo(EcosystemInfoRequest.fromPartial({}));

    const ecosystem = infoResponse.ecosystem;

    return ecosystem?.id;
}

console.log(`Trinsic Ecosystem id=${await getEcoSystemId()}`);

const requestRouter = require('./routes/requests');
const credentialRouter = require('./routes/credentials');

app.use('/api/requests', requestRouter);
app.use('/api/credential-schemas', credentialRouter);

app.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});
