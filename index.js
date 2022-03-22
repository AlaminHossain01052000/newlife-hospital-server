const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const port = process?.env?.PORT || 5000;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());
app.use("/api/product", product);
// 
// 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.li11u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db("newlife_hospital").collection("services");
        const doctorCollection = client.db("newlife_hospital").collection("doctors");
        const appointmentCollection = client.db("newlife_hospital").collection("appointments");
        const userCollection = client.db("newlife_hospital").collection("users");
        const reviewCollection = client.db("newlife_hospital").collection("reviews");

        app.get("/services", async (req, res) => {
            const services = await serviceCollection.find({}).toArray();
            res.json(services);
        })
        app.get("/doctors", async (req, res) => {
            const doctors = await doctorCollection.find({}).toArray();
            res.json(doctors);
        })
        app.get("/appointments", async (req, res) => {
            const appointments = await appointmentCollection.find({}).toArray();
            res.json(appointments);
        })
        app.get("/appointments/email", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const appointments = await appointmentCollection.find(query).toArray();
            res.json(appointments);
        })



        app.put("/appointments/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const updateDoc = { $set: { status: "approved" } };
            const options = { upsert: false };
            const appointments = await appointmentCollection.updateOne(query, updateDoc, options);
            res.json(appointments);


        })
        app.get("/doctors/:id", async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await doctorCollection.findOne(query);
            res.json(result);
        })


        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.json(result);
        })
        // ==================HANDLE REVIEWS=============

        app.get("/reviews", async (req, res) => {
            const review = await reviewCollection.find({}).toArray();
            res.send(review);
        })

        app.get("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.json(review);
        })
        app.get("/reviews/email/user", async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email };
            const review = await reviewCollection.find(query).toArray();
            res.json(review);


        })

        app.post("/reviews", async (req, res) => {

            const review = await reviewCollection.insertOne(req.body);
            res.json(review);
        })
        app.put("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const updateDoc = { $set: { status: "approved" } };
            const options = { upsert: false };
            const reviews = await reviewCollection.updateOne(query, updateDoc, options);
            res.json(reviews);
        })
        // =====================ALL POST METHODS===============
        app.post("/appointments", async (req, res) => {

            const newAppointment = await appointmentCollection.insertOne(req.body);
            res.json(newAppointment);
        })
        // =====================ALL PUT METHODS===============
        app.put("/users", async (req, res) => {
            const filter = { email: req.body.email };
            const options = { upsert: true }
            const user = { $set: req.body };
            const result = await userCollection.updateOne(filter, user, options);
            res.json(result);
        })
        // =========================Handle User(Signup/signin) info==========
        app.get("/users", async (req, res) => {
            const allUsers = await userCollection.find({}).toArray();
            res.json(allUsers);
        })

        // get a particular user
        app.get("/users/single", async (req, res) => {

            const particularUser = await userCollection.findOne({ email: req.query.email });
            res.json(particularUser);
        })

        // confirming does the logged in user is admin or not
        app.get("/users/admin", async (req, res) => {
            const email = req.query.email;
            const particularUser = await userCollection.findOne({ email: email });


            let isAdmin = false;
            if (particularUser?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // make a user admin
        app.put("/users", async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = { $set: { role: "admin" } };
            const newAdmin = await userCollection.updateOne(filter, updateDoc, options);
            res.json(newAdmin);

        })

        app.put("/doctors/:id", async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = { $set: { numberOfReview: numberOfReview + 1 } };
            const result = await userCollection.updateOne(query, updateDoc, options);
            res.json(result);
        })
        // post a new user in database
        app.post("/users", async (req, res) => {

            const newUser = await userCollection.insertOne(req.body);
            res.json(newUser);
        })
        app.put("/users", async (req, res) => {
            const filter = { email: req.body.email };
            const options = { upsert: true }
            const user = { $set: req.body };
            const result = await userCollection.updateOne(filter, user, options);
            res.json(result);
        })

    }
    finally {

    }

}
run().catch(console.dir);

app.get("/", (req, res) => {

    res.json("Backend is working");
})
app.listen(port, () => {
    console.log("Listening to port ", port);
})