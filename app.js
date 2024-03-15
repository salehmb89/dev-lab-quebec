require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5500;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
// set the view engine to ejs
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function getChainsawData() {
  try {
    await client.connect();
    const result = await client.db("saleh-quebec").collection("chainsaw-inventory").find().toArray();
    return result;
  } catch (err) {
    console.error("getChainsawData() error: ", err);
    throw err; // Rethrow the error to be caught in the route handler
  } finally {
    await client.close();
  }
}

async function getDrinkData() {
  try {
    await client.connect();
    const result = await client.db("chillAppz").collection("drinkz").find().toArray();
    return result;
  } catch (err) {
    console.error("getDrinkData() error: ", err);
    throw err; // Rethrow the error to be caught in the route handler
  } finally {
    await client.close();
  }
}

// Reading from MongoDB
app.get('/', async (req, res) => {
  try {
    let chainsawData = await getChainsawData().catch(console.error);
    let drinkData = await getDrinkData().catch(console.error);

    res.render('index', {
      pageTitle: "saleh's saws",
      chainsawData: chainsawData,
      drinkData: drinkData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});

// Create to MongoDB 
app.post('/addSaw', async (req, res) => {
  try {
    // Connect to the MongoDB client before performing operations
    await client.connect();
    
    const collection = client.db("saleh-quebec").collection("chainsaw-inventory");

    // Draw from body parser
    console.log(req.body);
    
    await collection.insertOne(req.body);

    // Disconnect from the MongoDB client after operations
    await client.close();

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});


app.post('/updateSaw/:id', async (req, res) => {
  try {
    // Connect to the MongoDB client before performing operations
    await client.connect();

    const collection = client.db("chillAppz").collection("drinkz");
    let result = await collection.findOneAndUpdate(
      { "_id": new ObjectId(req.params.id) }, 
      { $set: { "size": "REALLY BIG DRINK" } }
    );

    console.log(result);

    // Disconnect from the MongoDB client after operations
    await client.close();

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});

app.post('/deleteDrink/:id', async (req, res) => {
  try {
    // Connect to the MongoDB client before performing operations
    await client.connect();

    const collection = client.db("chillAppz").collection("drinkz");
    let result = await collection.findOneAndDelete(
      { "_id": new ObjectId(req.params.id) }
    );

    console.log(result);

    // Disconnect from the MongoDB client after operations
    await client.close();

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});



app.get('/name', (req, res) => {
  console.log("in get to slash name:", req.query.ejsFormName);
  myTypeServer = req.query.ejsFormName;
  res.render('index', {
    myTypeClient: myTypeServer,
    myResultClient: "myResultServer"
  });
});

app.listen(port, () => {
  console.log(`salehs saws (quebec) app listening on port ${port}`);
});
