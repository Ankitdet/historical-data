const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const fs = require('fs');
const port = 3005
const readLine = require('readline');
const csvParser = require('csv-parser');
const { GOLD, BITCOIN, GOLD_FILEPATH, BITCOIN_FILEPATH, CRUDE_FILEPATH, USD_FILEPATH, TREASURY_FILEPATH, NIKKEI, NIKKEI_FILEPATH, CMC_FILEPATH, CRUDE, USD, CMC, TREASURY, NASDAQ, NASDAQ_FILEPATH, AGILENT, AGILENT_FILEPATH, BARNES_FILEPATH, CONCORD_FILEPATH, FORTRESS_FILEPATH, BARNES, CONCORD, FORTRESS } = require('./constant');
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
    const query = req.query.search;
    let filePath = "";
    if (query.toLowerCase() === GOLD.toLowerCase()) {
        filePath = GOLD_FILEPATH;
    } else if (query.toLowerCase() == BITCOIN.toLowerCase()) {
        filePath = BITCOIN_FILEPATH;
    } else if (query.toLowerCase() == CRUDE.toLowerCase()) {
        filePath = CRUDE_FILEPATH
    } else if (query.toLowerCase() == USD.toLowerCase()) {
        filePath = USD_FILEPATH
    } else if (query.toLowerCase() == TREASURY.toLowerCase()) {
        filePath = TREASURY_FILEPATH
    } else if (query.toLowerCase() == NIKKEI.toLowerCase()) {
        filePath = NIKKEI_FILEPATH
    } else if (query.toLowerCase() == CMC.toLowerCase()) {
        filePath = CMC_FILEPATH
    } else if (query.toLowerCase() == NASDAQ.toLowerCase()) {
        filePath = NASDAQ_FILEPATH
    } else if (query.toLowerCase() == AGILENT.toLowerCase()) {
        filePath = AGILENT_FILEPATH
    } else if (query.toLowerCase() == BARNES.toLowerCase()) {
        filePath = BARNES_FILEPATH
    } else if (query.toLowerCase() == CONCORD.toLowerCase()) {
        filePath = CONCORD_FILEPATH
    } else if (query.toLowerCase() == FORTRESS.toLowerCase()) {
        filePath = FORTRESS_FILEPATH
    }

    if (filePath !== "") {
        new Promise((resolve, rej) => {
            readFromN2M(path.resolve(__dirname) + filePath).then((data) => {
                resolve(data);
            })
        }).then((data) => {
            res.send({ data: data }).status(200)
        });
    } else {
        res.send({ data: 'no data found' }).status(400)
    }
})


async function readFromN2M(fileName) {
    const lineReader = readLine.createInterface({
        input: fs.createReadStream(fileName)
    })
    return new Promise((res, rej) => {
        let data = [];
        fs.createReadStream(fileName)
            .pipe(csvParser(['date', 'open', 'high', 'low', 'close', 'adjClose', 'volume']))
            .on('data', (row) => {
                data.push(row);
            }).on('end', () => {
                console.log('done reading');
                res(data.slice(1));
            });
    }).then((data) => {
        return data;
    }).catch((err) => {
        return err;
    });
}

app.get('/stockname', (req, res) => {
    let data = [
        {
            name: GOLD,
            id: 1
        }
        , {
            name: BITCOIN,
            id: 2
        }, {
            name: CRUDE,
            id: 3
        }, {
            name: USD,
            id: 4
        }, {
            name: TREASURY,
            id: 5
        }, {
            name: NIKKEI,
            id: 6
        }, {
            name: CMC,
            id: 7
        }, {
            name: NASDAQ,
            id: 9
        }, {
            name: AGILENT,
            id: 10
        }, {
            name: BARNES,
            id: 11
        }, {
            name: CONCORD,
            id: 12
        }, {
            name: FORTRESS,
            id: 13
        }
    ];
    let find = req.query.search;
    let array = containsAny(find, data);
    res.status(200).send({ data: array });
})

function containsAny(str, substrings) {
    let searchItems = [];
    for (var i = 0; i < substrings.length; i++) {
        if (substrings[i].name.toLowerCase().indexOf(str.toLowerCase()) != -1) {
            searchItems.push(substrings[i]);
        }
    }
    return searchItems;
}


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})