const express = require("express");
const { sample } = require("underscore");
//const {MongoClient} = require("mongodb");

const app = express();

const port = process.env.PORT || 5001;
app.listen(port, ()=>{console.log(`listening @ port ${port}`)});
app.use(express.json());

app.use(express.static('../'));     // for testing only

app.get('/api', (request, response)=>{
	// response.json({message: 'the database is connected.'});
    response.json(sample_data)
});

app.post("/api", async (request, response)=>{
    const data = request.body;
    //await main(data);
    console.log('New High Score:');
    console.log(data);
    sample_data.push({name:data.name, score:data.score, id:''});

    console.log('Added High Score to List:');
    console.log(sample_data);

    // remove lowest score
    sample_data.forEach((scoreObj)=>{
        if(scoreObj.id === data.id){
            sample_data.splice(sample_data.indexOf(scoreObj), 1);
        }
    });

    console.log('New High Score List:');
    console.log(sample_data);
    response.json({data: 'high score list updated!'});
});


async function main(data){
    const newHighScore = {name:"", score:""};
    const id = "";
    
    const password = process.env.DB_PWD || "";
    const uri = `mongodb+srv://robot-army:<password>@cluster0.cxoh44a.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);

    try {
        await client.connect();

        await addNewHighScore(client, newHighScore);
        await deleteOldHighScore(client, id);

    } catch (error) {
        console.error(error)
    }finally{
        await client.close();
    }
}

async function addNewHighScore(client, newHighScore){
	const result = await client.db("DATABASE_NAME").collection("COLLECTION_NAME").insertOne(newHighScore);
	console.log(`New high score added with id: ${result.insertedId}`);
}

async function deleteOldHighScore(client, id){
    const result = await client.db("DATABASE_NAME").collection("COLLECTION_NAME").deleteOne({_id:id});
    console.log(`${result.deleteCount} document(s) was/were deleted.`)
}

let sample_data = [
    {
        name:   "wolf_1",
        score:  "123",
        id:     "01"
    },
    {
        name:   "bear_2",
        score:  "89",
        id:     "02"
    },
    {
        name:   "fox_3",
        score:  "3",
        id:     "03"
    },
    {
        name:   "snake_4",
        score:  "153",
        id:     "04"
    },
    {
        name:   "tiger_5",
        score:  "13",
        id:     "05"
    },
]

// high-to-low: 4 1 2 5 3