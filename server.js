const express = require('express');
const app = express();

const {join} = require('path');
const bodyparser = require('body-parser');
const dbClient = require('./server/mongo/client.js');

app.use(express.static(join(__dirname, 'public')));
app.use(bodyparser.urlencoded({extended: true}));

app.get('/quotes', (req, res) => {
  dbClient.getCollection(res, 'quotes');
});

app.post('/quotes', (req, res) => {
  dbClient.insertItem(res, 'quotes', req.body);
});

app.delete('/quotes', (req, res) => {
  dbClient.removeItem(res, 'quotes', req.body);
});

app.put('/quotes', (req, res) => {
  dbClient.updateItem(res, 'quotes', req.body);
});

app.listen(1976, ()=>{console.log('MongoExpress listening on 1976');});
