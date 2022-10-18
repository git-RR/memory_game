const express = require("express");
const {MongoClient} = require("mongodb");

const app = express();

const port = process.env.PORT || 5001;
app.listen(port, ()=>{console.log(`listening @ port ${port}`)});
app.use(express.json());

app.post("/api", async (request, response)=>{
    const data = request.body;
    await main(data);
    response.end();
});

async function main(data){
    const password = process.env.DB_PWD || "";
    const uri = `mongodb+srv://...`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
    } catch (error) {
        console.error(error)
    }finally{
        await client.close();
    }
}