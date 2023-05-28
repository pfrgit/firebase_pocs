const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const app = express();

const firestoreExpImp = require('firestore-export-import')
const { db, fireStoreFieldValue, getStorage } = require("../common/admin");


app.post("/backup",  (req, res) => {
  //creates local backup of firestore and then uploads to firebase cloud bucket

  firestoreExpImp.backups().then((json)=>{
    const content = JSON.stringify(json)

    fs.writeFile('backup.json', content, function (err) {
      if (err) throw err;
      console.log('Saved locally!');
    });
    var bucket = getStorage().bucket("gs://appbackup-caed2.appspot.com")
    bucket.upload('backup.json', ()=>{
      console.log("backup complete!")
    })
  }).catch((error) =>{
    console.error('Error occured:', error);
  });
});


app.post("/restore",  (req, res) => {
  //downloads backup from cloud storage bucket, and then restores firestore using local JSON file
  const cloudpath = 'backup.json'
  const localpath = 'backup.json'

  var bucket = getStorage().bucket("gs://appbackup-caed2.appspot.com")
  const file = bucket.file(cloudpath); 
  file.download({ destination: localpath })
    .then(() => {
      console.log('File downloaded successfully.');
    })
    .then(() => {
      firestoreExpImp.restore(localpath)
    })
    .catch((error) => {
      console.error('Error occured:', error);
    });
});

exports.restApiBackupOpt1 = functions.https.onRequest(app);
