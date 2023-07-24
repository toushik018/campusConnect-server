const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware

app.use(cors())
app.use(express.json());






const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qesst1e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)



        const usersCollection = client.db("campusConnect").collection("users");
        const collegesCollections = client.db("campusConnect").collection("colleges");
        const candidatesCollections = client.db("campusConnect").collection("candidates");
        const reviewsCollections = client.db("campusConnect").collection("reviews");




        app.get('/colleges', async (req, res) => {
            const result = await collegesCollections.find().toArray();
            res.send(result)

        })



        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)

        })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const result = await usersCollection.findOne(query);
            res.send(result)
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User already exist' })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result)
        })



        app.patch('/update-profile/:id', async (req, res) => {
            try {
              const userId = req.params.id;
              const { name, university, address, email } = req.body;
          
              // Update the user data in the database
              const result = await usersCollection.findOneAndUpdate(
                { _id: new ObjectId(userId) },
                { $set: { name, university, address, email } },
                { returnOriginal: false }
              );
          
              // Send back the updated user data as a response
              res.json(result.value);
            } catch (error) {
              console.error('Error updating user profile:', error);
              res.status(500).json({ error: 'Something went wrong. Please try again later.' });
            }
          });



        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            // if (req.decoded.email !== email) {
            //     res.send({ admin: false })
            // }

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
        })


        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {

                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })



        app.post("/colleges", async (req, res) => {
            const college = req.body;
            const result = await collegesCollections.insertOne(college);
            res.send(result);
        });

        app.get("/colleges/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await collegesCollections.findOne(query);
            res.send(result);
        });



        app.post("/candidates", async (req, res) => {
            const candidate = req.body;
            const result = await candidatesCollections.insertOne(candidate);
            res.send(result);
        });

        app.get('/candidates', async (req, res) => {
            const result = await candidatesCollections.find().toArray();
            res.send(result)
        });


        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewsCollections.insertOne(review);

            // Assuming the server returns the updated list of reviews for the specific college
            const reviewsForCollege = await reviewsCollections.find({ collegeId: review.collegeId }).toArray();

            res.send({ reviews: reviewsForCollege });
        });

        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollections.find().toArray();
            res.send(result)
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Campus Connect is connected')
})

app.listen(port, () => {
    console.log(`Server running on ${port}`)
})