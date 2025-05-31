const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config()

// Middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qks7w9t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    

    const jobsCollection = client.db('career-code').collection('jobs');
    const applicationsCollection = client.db('career-code').collection('applications')

    // Jobs API
    app.get('/jobs', async(req,res) =>{


        const email = req.query.email;
        const query = {};
        if(email){
            query.hr_email = email;
        }

        const cursor = jobsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    });

    // Could be done but should not by done
    // app.get('/jobsByEmailAddress', async(req, res) =>{
    //     const email = req.query.email;
    //     const query = {hr_email: email};
    //     const result = await jobsCollection.find(query).toArray();
    //     res.send(result);
    // })

    app.get('/jobs/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await jobsCollection.findOne(query);
        res.send(result);
    });

    app.post('/jobs', async(req, res) =>{
        const newJob = req.body;
        console.log(newJob);
        const result = await jobsCollection.insertOne(newJob);
        res.send(result);
    });

    // Job application related API's
    app.get('/applications', async(req, res) =>{
        const email = req.query.email;

        const query = {
            applicant : email
        };
        const result = await applicationsCollection.find(query).toArray();

        // Bad way to aggregate data
        for(const application of result){
            const jobId = application.jobId;
            const jobQuery = {_id: new ObjectId(jobId)};
            const job = await jobsCollection.findOne(jobQuery);
            application.company = job.company;
            application.title = job.title;
            application.company_logo = job.company_logo
        }


        res.send(result);
    });

    app.get('/applications/job/:job_id', async(req, res) =>{
        const job_id = req.params.job_id;
        const query = {jobId: job_id};
        const result = await applicationsCollection.find(query).toArray();
        res.send(result);
    });


    app.post('/applications', async(req, res) =>{
        const application = req.body;
        console.log(application);
        const result = await applicationsCollection.insertOne(application);
        res.send(result)
    });

    app.patch('/applications/:id', async(req, res) =>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updatedDoc = {
            $set: {
                status : req.body.status
            }
        }

        const result = await applicationsCollection.updateOne(filter, updatedDoc);
        res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Career code cooking')
})


app.listen(port, () =>{
    console.log(`Career code running on port ${port}`)
    
})