const http = require('http');
const app = require('./app');
require('dotenv').config();

const server = http.createServer(app);

const port = process.env.PORT || 8000;

server.listen(port, () => {
    console.log(`Serving on port ${port}`);
})

