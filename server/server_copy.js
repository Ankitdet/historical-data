const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const fs = require('fs');
const port = 3005
const readLine = require('readline');
const csvParser = require('csv-parser');
const { GOLD, BITCOIN, GOLD_FILEPATH, BITCOIN_FILEPATH, CRUDE_FILEPATH, USD_FILEPATH, TREASURY_FILEPATH, NIKKEI, NIKKEI_FILEPATH, CMC_FILEPATH, CRUDE, USD, CMC } = require('./constant');
var data = []
require('events').EventEmitter.defaultMaxListeners = 25


const param = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
};
app.use(cors(param));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

app.get('/stock/fetch', (req, res) => {
  const start = req.query.start || 0;
  const end = req.query.end || 10;

  const lines = get_line('./csv/gold.csv', start, end, (error, data) => {
    console.log('inside get line called', data);
    res.send({data : data}).status(200);
  });
})


function get_line(filename, start, end, callback) {
  fs.readFile(filename, function (err, data) {
    if (err) throw err;

    // Data is a buffer that we need to convert to a string
    // Improvement: loop over the buffer and stop when the line is reached
    var lines = data.toString('utf-8').split("\n");
    var iMax = 0;
    let stockData = [];
    for (var i = start, iMax = end; i < iMax; i++) {
      stockData.push(lines[i]);
    }
    callback(null, stockData);
  });
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})