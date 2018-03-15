'use strict';

module.exports = (function() {
  const MongoClient = require('mongodb').MongoClient;
  const ObjectId = require('mongodb').ObjectId;
  const DATABASE = 'star-wars-quotes';
  const _dbClient = {

    getDbAccess: function accessDb() {
      return MongoClient.connect('mongodb://localhost:28018');
    },

    getCollection: function getCollection(res, collectionName, data) {
      this.getDbAccess()
        .then(client => {
          collectionName = collectionName || 'quotes';
          const db = client.db(DATABASE);
          const collectionData = db.collection(collectionName).find(data);
          collectionData.toArray()
            .then(this.returnData(res))
            .catch(inErr => {res.status(503).send('DB_CLIENT_ERROR', inErr);})
        })
        .catch(err => {res.status(500).send('INTR_ERROR_COLLECTION');});
    },

    insertItem: function insert(res, collectionName, data) {
      const dbProm = this.getDbAccess()
      dbProm.then(client => {
        collectionName = collectionName || 'quotes';
        const db = client.db(DATABASE);
        const insertPromise = db.collection(collectionName).save(data);
        insertPromise.then(result => {
          if (result) {
            this.getCollection(res, collectionName);
          }
          else {
            res.status(500).send('DB_CLIENT_ERROR:INSERT');
          }
        });
      })
      .catch(err => {res.status(500).send('INTR_ERROR_COLLECTION');});
    },

    removeItem: function remove(res, collectionName, data) {
      const dbProm = this.getDbAccess();
      dbProm.then(client => {
        if (! data._id ) throw new Error('No ID for delete');
        data._id = ObjectId(data._id);
        const db = client.db(DATABASE);
        const removeProm = db.collection(collectionName).deleteOne(data);
        removeProm.then( result => {
          if (result) {
            this.getCollection(res, collectionName);
          }
          else {
            this.status(500).send('DB_CLIENT_ERROR:REMOVE_NR');
          }
        })
        .catch(err => {res.status(500).send('DB_CLIENT_ERROR:REMOVE_UKN');});
      })
      .catch( err => {res.status(500).send('INTR_ERROR_REMOVE');});
    },

    updateItem: function update(res, collectionName, data) {
      const dbProm = this.getDbAccess();
      dbProm.then(client => {
        if (! data._id ) throw new Error('No ID for update');
        const
          query = { _id: ObjectId(data._id)},
          updateData = {};
          Object.keys(data).reduce((acc, key) => {
            if (key !== '_id')
              acc[key] = data[key];
              return acc;
            }, updateData);

        const db = client.db(DATABASE);
        const updateProm = db.collection(collectionName).update(query, updateData);
        updateProm.then(result => {
          if (result) {
            this.getCollection(res, collectionName);
          }
          else {
            this.status(500).send('DB_CLIENT_ERROR:UPDATE_NR');
          }
        })
        .catch(err => {res.status(500).send('DB_CLIENT_ERROR:UPDATE_UKN');});
      })
      .catch(err => {res.status(500).send('INTR_ERROR_UPDATE');});
    },

    returnData(res) {
      return function _returnData(results) {
        res.json(results);
      }
    }

  };
  return _dbClient;
})();
