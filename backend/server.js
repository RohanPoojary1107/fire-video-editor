var express = require("express");
var app = express();
var port = 8000;
const CLIENT_ID = "956647101334-784vc8rakg2kbaeil4gug1ukefc9vehk.apps.googleusercontent.com";

const { OAuth2Client } = require('google-auth-library');
const loginClient = new OAuth2Client(CLIENT_ID);

const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://dbUser:fire@2021@fire.fojp1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var cors = require("cors");

var db;
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

client.connect((err) => {
  db = client.db("fire_db");
  console.log("Connected to DB...");
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
});

// create endpoints using express here
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/auth/login", async (req, res) => {
  const { token }  = req.body
    const ticket = await loginClient.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const { name, email, picture} = ticket.getPayload();
    console.log(email);
    console.log(name);
    res.status(200).json({ email: email});
})
app.put("/addProject", (req, res) => {
  console.log(req);
  let data = {
    title: req.body.title,
    frameRate: req.body.frameRate,
    width: req.body.width,
    height: req.body.height,
  };
  db.collection("projects").insertOne(data, function (err, response) {
    if (err) throw err;
    console.log("Document inserted");
    // res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ message: "ok" });
  });
});
