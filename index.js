const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());


//*********** DATABASE **************** */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0v9zw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const runDatabase = async () => {
    try {
        await client.connect();
        const database = client.db("worldwideBuddy");
        const plansCollection = database.collection("plans");
        const ordersCollection = database.collection("orders");

        // GET ALL PLANS
        app.get('/plans', async (req, res) => {
            const cursor = plansCollection.find({});
            const plans = await cursor.toArray();
            res.send(plans);
        });

        // SET A PLAN TO DATABASE
        app.post('/plans', async (req, res) => {
            const plan = req.body;
            const result = await plansCollection.insertOne(plan);
            res.send(result);
        })

        // GET ALL ORDERS
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // GET ORDERS BY USER EMAIL
        app.get('/orders/:email', async (req, res) => {
            const userEmail = req.params.email;
            const query = { Email: { $in: [userEmail] } };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // APPROVE AN ORDER ( FOR SPECIFIC USER )
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set : {
                    status: 'Approved'
                }
            };
            const result = await ordersCollection.updateOne(query, updateDoc);
            res.json(result);
        })

        //  DELETE AN ORDER ( FOR SPECIFIC USER )
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        // SET AN ORDER TO DATABASE
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        // BOOK A SINGLE PLAN
        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await plansCollection.findOne(query);
            res.json(result);
        })

        //  DELETE A PLAN
        app.delete('/plans/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await plansCollection.deleteOne(query);
            res.json(result);
        })


    } finally {
        // DO nothing
    }
}

runDatabase().catch(console.dir);





// *********** NODE SERVER ************ //

app.get("/", (req, res) => {
    res.send("Worldwide buddy server is running");
})
app.listen(port, () => {
    console.log('Running on port', port)
});
