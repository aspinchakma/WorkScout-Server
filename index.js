require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// this is root
app.get("/", (req, res) => {
  res.send("WorkScout Website Server");
});

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k8wvow9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const companyCollection = client.db("WorkScout").collection("companies");

    // COMPANY----------------------------
    // get all companies data from the database
    app.get("/companies", async (req, res) => {
      const result = await companyCollection.find({}).toArray();
      res.send(result);
    });
    // post company data to the database
    app.post("/companies", async (req, res) => {
      const companyInfo = req.body;
      const result = await companyCollection.insertOne(companyInfo);
      res.send(result);
    });

    // get companies details
    app.get("/companydetails/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await companyCollection.findOne(filter);
      res.send(result);
    });
    // get companies 3 data from database
    app.get("/companies/3", async (req, res) => {
      const cursor = companyCollection.find({}).limit(3);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`WorkScout app listening on port ${port}`);
});
