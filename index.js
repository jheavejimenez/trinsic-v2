const express = require('express');
const cors = require('cors')
const app = express();
const PORT = 8080;

// middleware
app.use(cors());
app.use(express.json());

const exampleRouter = require('./routes/example');
app.use('/api/example', exampleRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
