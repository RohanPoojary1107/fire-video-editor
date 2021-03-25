var express = require("express");
var cors = require("cors");
var app = express();
var port = 8000;
var db;
var authToken = false;
const CLIENT_ID =
  "956647101334-784vc8rakg2kbaeil4gug1ukefc9vehk.apps.googleusercontent.com";
const uri =
  "mongodb+srv://dbUser:fire@2021@fire.fojp1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const { OAuth2Client } = require("google-auth-library");
const loginClient = new OAuth2Client(CLIENT_ID);
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

// project endpoints

app.post("/auth/login", async (req, res) => {
  const { token } = req.body;
  const ticket = await loginClient.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  authToken = true;
  const { name, email, picture } = ticket.getPayload();
  res.status(200).json({ email: email });
});

app.put("/addProject", (req, res) => {
  let data = {
    projectUser: req.body.projectUser,
    title: req.body.title,
    frameRate: req.body.frameRate,
    width: req.body.width,
    height: req.body.height,
  };
  db.collection("projects").insertOne(data, (err, response) => {
    if (err) {
      res
        .status(400)
        .json({ error: "Unable to create project. Try again later!" });
    } else if (response.insertedCount === 1) {
      res
        .status(200)
        .json({ success: "Project has been successfully created." });
    } else {
      res
        .status(500)
        .json({ error: "Unable to create project. Try again later!" });
    }
  });
});

app.put("/editProject", (req, res) => {
  let data = {
    title: req.body.title,
    frameRate: req.body.frameRate,
    width: req.body.width,
    height: req.body.height,
  };
  let _id = req.body._id;
  db.collection("projects").findOneAndUpdate(
    { _id: new ObjectID(_id) },
    { $set: data },
    { upsert: true },
    (err, response) => {
      if (err) {
        res
          .status(400)
          .json({ error: "Unable to edit project. Please try again!" });
      } else {
        res
          .status(200)
          .json({ success: "Project has been successfully edited." });
      }
    }
  );
});

app.put("/saveProject", (req, res) => {
  const update = {
    $set: {
      mediaList: req.body.mediaList,
      trackList: req.body.trackList,
    },
  };
  const query = { projectId: "123" };
  const options = { upsert: true };

  db.collection("projectFiles").updateOne(
    query,
    update,
    options,
    (err, response) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Unable to save project to cloud. Try again later!" });
      } else if (response.matchedCount === 1 || response.upsertedCount === 1) {
        res
          .status(200)
          .json({ success: "Project has been saved successfully!" });
      } else {
        res
          .status(500)
          .json({ error: "Unable to save project to cloud. Try again later!" });
      }
    }
  );
});

app.delete("/deleteProject/:id", (req, res) => {
  if (authToken == false) return;
  const query = {
    _id: new ObjectID(req.params.id),
  };
  db.collection("projects").deleteOne(query, (err, response) => {
    if (err) {
      res
        .status(400)
        .json({ error: "Unable to delete project. Try again later!" });
    } else {
      const query1 = {
        projectId: req.params.id,
      };
      db.collection("projectFiles").deleteOne(query1, (err, response) => {
        if (err) {
          res
            .status(400)
            .json({ error: "Unable to delete project. Try again later!" });
        } else {
          res
            .status(200)
            .json({ success: "Project has been successfully deleted." });
        }
      });
    }
  });
});
