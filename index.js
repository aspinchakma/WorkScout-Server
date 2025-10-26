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
    const usersCollection = client.db("WorkScout").collection("users");
    const jobsCollection = client.db("WorkScout").collection("jobs");
    const bidsCollection = client.db("WorkScout").collection("bids");

    // USERS -----------------
    // store user information to the database
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // get user info using their id
    app.get("/users/userInfo/:id", async (req, res) => {
      const userId = req.params.id;
      const query = { _id: new ObjectId(userId) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // get specific users data
    app.get("/user/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    // get only 3 users data
    app.get("/users/limitedData", async (req, res) => {
      const cursor = usersCollection.find({}).limit(4);
      const users = await cursor.toArray();
      res.send(users);
    });

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

    // get specific comanies
    app.get("/selectedCompanies/:id", async (req, res) => {
      const id = req.params.id;
      const companies = await companyCollection
        .find({
          creatorId: id,
        })
        .toArray();
      res.send(companies);
    });
    // delete specific comapny
    app.delete("/selectedCompanies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await companyCollection.deleteOne(query);
      res.send(result);
    });

    // JOBS section --------------------
    // get all jobs
    app.get("/jobs", async (req, res) => {
      // aggreegation or projection
      const upCommingJobs = await jobsCollection
        .aggregate([
          {
            $addFields: {
              deadlineDate: { $toDate: "$deadline" }, // string to date convert
            },
          },
          {
            $match: { deadlineDate: { $gte: new Date() } },
          },
          {
            $sort: { deadlineDate: 1 }, // ascending
          },
        ])
        .toArray();
      res.send(upCommingJobs);
    });
    // store jobs to the database
    app.post("/jobs", async (req, res) => {
      const jobDetails = req.body;
      jobDetails.deadline = new Date(jobDetails.deadline).toISOString();
      jobDetails.createdAt = new Date().toISOString();
      const result = await jobsCollection.insertOne(jobDetails);
      res.send(result);
    });

    // get single jobs
    app.get("/jobs/:id", async (req, res) => {
      const jobsId = req.params.id;
      const query = { _id: new ObjectId(jobsId) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // get jobs in company Details section
    app.get("/jobs/companyDetails/:byComapnyId", async (req, res) => {
      const companyId = req.params.byComapnyId;
      const jobs = await jobsCollection
        .find({ companyId: companyId })
        .toArray();
      res.send(jobs);
    });

    // get jobs by user id who create jobs
    app.get("/jobs/user/:id", async (req, res) => {
      const creatorId = req.params.id;
      console.log(creatorId);
      const query = { creatorId: creatorId };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Bids --------------------------
    // update bids
    app.post("/bids", async (req, res) => {
      const bidInfo = req.body;
      const result = await bidsCollection.insertOne(bidInfo);
      res.send(result);
    });
    // get bids info according to user id
    app.get("/bids/:userId", async (req, res) => {
      const userId = req.params.userId;
      const cursor = bidsCollection.find({
        userId: userId,
      });
      const result = await cursor.toArray();
      res.send(result);
    });

    //get bids info according to job id
    app.get("/bids/jobDetails/:id", async (req, res) => {
      const numberId = req.params.id;
      const cursor = bidsCollection.find({ jobId: numberId });
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`WorkScout app listening on port ${port}`);
});
