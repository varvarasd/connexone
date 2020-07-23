const express = require('express');
const promMid = require('express-prometheus-middleware');

const server = express();
server.use(express.json());

server.use('*', (req, res, next) => {
    if(req.headers.authorization !== 'mysecrettoken') {
        res.status(403).send('Not authorised')
    }
    next();
});

server.use(promMid({
    authenticate: req => req.headers.authorization === 'mysecrettoken',
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5]
}));


const schema = {
    properties: {
        epoch: {
            description: "Some description",
            type: "number"
        }
    },
    required: ["epoch"],
    type: "object"
}

server.get('/time', (req, res, next) => {
    res.send(schema);
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, err => {
    if (err) 
        throw err;
    console.log(`Server running at http://localhost:${PORT}`);
});