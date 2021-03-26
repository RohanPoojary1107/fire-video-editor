var express = require("express");
var cors = require("cors");
var app = express();
var port = 8000;
var db;
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
app.use(express.json({limit: '50mb'}));
app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
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
app.use("/", async (req, res, next) => {
  try {
    const ticket = await loginClient.verifyIdToken({
      idToken: req.headers.authorization.split("Bearer ")[1],
      audience: CLIENT_ID,
    });
    req.email = ticket.getPayload().email;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.get("/getEmail", async (req, res) => {
  res.status(200).json({ email: req.email });
});

app.get("/getProjects", (req, res) => {
  db.collection("projects")
    .find({ owner: req.email })
    .toArray((err, response) => {
      if (err) {
        res
          .status(400)
          .json({ error: "Unable to get project. Try again later!" });
      } else {
        res.status(200).json(response);
      }
    });
});

app.put("/addProject", (req, res) => {
  let data = {
    owner: req.email,
    name: req.body.name,
    framerate: req.body.framerate,
    width: req.body.width,
    height: req.body.height,
  };
  db.collection("projects").insertOne(data, (err, response) => {
    if (err) {
      res
        .status(400)
        .json({ error: "Unable to create project. Try again later!" });
    } else if (response.insertedCount === 1) {
      res.status(200).json(response.ops[0]);
    } else {
      res
        .status(500)
        .json({ error: "Unable to create project. Try again later!" });
    }
  });
});

app.put("/editProject", (req, res) => {
  let data = {
    _id: new ObjectID(req.body._id),
    owner: req.email,
    name: req.body.name,
    framerate: req.body.framerate,
    width: req.body.width,
    height: req.body.height,
  };
  db.collection("projects").findOneAndUpdate(
    { _id: new ObjectID(data._id), owner: req.email },
    { $set: data },
    (err, response) => {
      if (err) {
        res
          .status(400)
          .json({ error: "Unable to edit project. Please try again!" });
      } else {
        res.status(200).json(response);
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
  const query = { projectId: req.body.projectId };
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
  const query = {
    _id: new ObjectID(req.params.id),
    owner: req.email,
  };
  db.collection("projects").deleteOne(query, (err, response) => {
    if (err) {
      res
        .status(400)
        .json({ error: "Unable to delete project. Try again later!" });
    } else {
      db.collection("projectFiles").deleteOne(
        { projectId: req.params.id },
        (err, response) => {
          if (err) {
            res
              .status(400)
              .json({ error: "Unable to delete project. Try again later!" });
          } else {
            res
              .status(200)
              .json({ success: "Project has been successfully deleted." });
          }
        }
      );
    }
  });
});
