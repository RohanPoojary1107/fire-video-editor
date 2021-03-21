var express = require('express')
var app = express()
var port = 8000;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:fire@2021@fire.fojp1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var db;

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

client.connect(err => {
    db = client.db("fire_db");
    console.log("Connected to DB...");
    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`)
    })
});

// create endpoints using express here
app.get('/', (req, res) => {
    res.send('Hello World!')
  })