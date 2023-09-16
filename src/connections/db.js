const { client } = require("../config/client");

const dbQueryMethods = (collections, method, query, update, limit, sort) => {
  switch (method) {
    case "find":
      return collections.find(query).toArray();
    case "findOne":
      return collections.findOne(query);
    case "insertOne":
      return collections.insertOne(update);
    case "delete":
      return collections.deleteOne(query);
    case "updateOne":
      return collections.updateOne(query, update, {
        upsert: true,
        returnDocument: true,
        returnNewDocument: true,
      });
    case "updateOneWithoutAbsert":
      return collections.updateOne(query, update, {
        upsert: false,
        returnDocument: true,
        returnNewDocument: true,
      });
    case "findWithLimit":
      return collections.find(query).sort(sort).limit(limit).toArray();
    default:
      return collections.find(query).toArray(query);
  }
};

async function db(params) {
  let doc;
  try {
    await client.connect();
    const database = client.db(params.database);
    const collections = database.collection(params.collection);
    doc = await dbQueryMethods(
      collections,
      params.method,
      params.query,
      params.update,
      params.limit,
      params.sort
    );
  } catch (e) {
    console.error(e);
  }
  return doc;
}

module.exports = db;
