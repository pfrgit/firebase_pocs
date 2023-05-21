const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const app = express();
const { db, fireStoreFieldValue } = require("../common/admin");

app.post("/", async (req, res) => {
  channelTypeInput = req.body["channeltype"];
  channelRefPath = req.body["channelRefPath"];

  console.log("channelRefPath: " + channelRefPath);

  res.status(200).send(
    JSON.stringify({
      returncode: 0,
      newGroupRefID: 123,
    })
  );
});

exports.restApiBackupOpt1 = functions.https.onRequest(app);
