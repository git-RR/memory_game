const express = require("express");
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

// app.post("./api", async (request, response)=>{
//     const data = request.body;
//     await main(data);
//     response.end();
// });

// async function main(data){
//     const password = process.env.DB_PWD || "";
//     const uri = `mongodb+srv://robot-army:<password>@cluster0.cxoh44a.mongodb.net/?retryWrites=true&w=majority`;
//     const client = new MongoClient(uri);
//     try {
//         await client.connect();
//     } catch (error) {
//         console.error(error)
//     }finally{
//         await client.close();
//     }
// }

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