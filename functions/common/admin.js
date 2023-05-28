const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
var storage = admin.storage();
const { getStorage } = require('firebase-admin/storage');
const fireStoreFieldValue = admin.firestore.FieldValue;

module.exports = {
  admin,
  db,
  storage,
  fireStoreFieldValue,
  getStorage
};
