const express = require("express");
// const { sample } = require("underscore");
const {MongoClient, ObjectId} = require("mongodb");
const localFile = require("./env");

const app = express();

const port = process.env.PORT || 5001;

const DATABASE_NAME             = "new_game";
const COLLECTION_NAME           = "high-scores"; 
const high_score_list_limit     = 10;

app.listen(port, ()=>{console.log(`listening @ port ${port}`)});
app.use(express.json());

app.use(express.static('../'));     // for testing only

app.get('/api', async (request, response)=>{
    const client = await main();
	const result = await getHighScores(client);
    //response.json(sample_data)
    response.json(result);
});

app.post("/api", async (request, response)=>{
    const data = request.body;
    const newHighScore = {name:data.name, score:data.score};
    const id = data.id;
    const client = await main();
    await addNewHighScore(client, newHighScore);
    await deleteOldHighScore(client, id);

    /* start test code */
    // console.log('New High Score:');
    // console.log(data);
    // sample_data.push({name:data.name, score:data.score, id:''});

    // console.log('Added High Score to List:');
    // console.log(sample_data);

    // // remove lowest score
    // sample_data.forEach((scoreObj)=>{
    //     if(scoreObj.id === data.id){
    //         sample_data.splice(sample_data.indexOf(scoreObj), 1);
    //     }
    // });

    // console.log('New High Score List:');
    // console.log(sample_data);
    response.json({data: 'high score list updated!'});
    /* end test code */
});
//main()
async function main(){
    // const newHighScore = {name:data.name, score:data.score};
    // const id = data.id;

    const password = process.env.DB_PWD || localFile.key;
    const uri = `mongodb+srv://robot-army:${password}@cluster0.cxoh44a.mongodb.net/?retryWrites=true&w=majority`;
    //const client = new MongoClient(uri);

    try {
        await client.connect();
        // await addNewHighScore(client, newHighScore);
        // await deleteOldHighScore(client, id);
        
        // await resetHighScoreCollection(client);
        // getHighScores(client)
        // const result = await client.db(DATABASE_NAME).collection(COLLECTION_NAME).deleteOne({_id:ObjectId('635befc24379eb3424036f8a')});

        return client;

    } catch (error) {
        console.error(error)
    }
    // finally{
    //     await client.close(); // client is used elsewhere; will not function if closed here
    // }
}

async function addNewHighScore(client, newHighScore){
	const result = await client.db(DATABASE_NAME).collection(COLLECTION_NAME).insertOne(newHighScore);
	console.log(`New high score added with id: ${result.insertedId}`);
}

async function deleteOldHighScore(client, id){
    const result = await client.db(DATABASE_NAME).collection(COLLECTION_NAME).deleteOne({_id:ObjectId(id)});
    console.log(`${result.deleteCount} document(s) was/were deleted.`)
}

async function getHighScores(client){
	const cursor = await client.db(DATABASE_NAME).collection(COLLECTION_NAME).find({}).sort({score: -1}).limit(high_score_list_limit);
    const result = await cursor.toArray();
    console.log(result);
    return result;
}

/* SAVE GAME */

app.get('/api/save-game', async (request, response)=>{
    // TODO
    // get username from request
    // check if username in database
    // yes: send save game data back; no: send not found message

    // console.log(request.url);
    // console.log(request.query);
    
    const player_name_query = request.query.playerName;
    const load_game_query = parseInt(request.query.loadGame);
    let found_player_name = false;
    let i = -1;

    for(i in test_save_game){
        // console.log(test_save_game[i])
        if(test_save_game[i].playerName === player_name_query){
            // response.send("found : "+test_save_game[i].playerName);
            //response.json(test_save_game[i]);
            //return;
            found_player_name = true;
            break;
        }
    }

    if( found_player_name ) {
        if( load_game_query ) {                 // load game
            response.json(test_save_game[i]);
            console.log('LOAD-SUCCESSFUL : data sent back');
        } else {                                // check to create new user    
            response.json({status:'unavailable'});
            console.log('CREATE FAILED : username already exists');
        }
    } else {
        if( load_game_query ) {                 // load game
            response.json({data: 404, message: `did not find : ${player_name_query}`});
            console.log(`LOAD-FAILED : did not find : ${player_name_query}`);
        } else {                                // check to create new user    
            response.json({status:'available'});
            console.log('CREATE SUCCESSFUL : username is available');
        }
    }

});

app.post("/api/save-game", async (request, response)=>{
    const data = request.body;
    //const newSaveGame = {};
    //const client = await main();

    // TODO 
    // check whether user has saved game before; 
    // yes: update; no: create new save game

    /* start test code */

    console.log('New Save Game:');
    console.log(data.playerName);

    test_save_game.push(data);
    // console.log('dummy DB: ')
    // console.log(test_save_game)
    response.json({data: 'game saved!'});
    /* end test code */
});

app.put("/api/save-game", async (request, response)=>{
    const data = request.body;

    /* start test code */

    console.log('Updating Save Game:');
    console.log(data.playerName);

    test_save_game.foreach(entry=>{
        if( test_save_game === data.playerName ) {
            console.log('old data');
            console.log(entry);

            entry.playerName = data.playerName
            entry.passphrase = data.passphrase
            entry.date = data.date
            entry.game = data.game
            entry.score1 = data.score1
            entry.tries1 = data.tries1
            data.blockMap.foreach(block=>{entry.blockMap.push(block)});

            console.log('new data');
            console.log(entry);

            return;
        }
    });

    


    // test_save_game.push(data);
    // console.log('dummy DB: ')
    // console.log(test_save_game)
    response.json({data: 'game saved!'});
    /* end test code */
});

/* test code */

let test_save_game = [
    /*
        format: {
            playerName: '',
            passphrase: '',
            date : '',
            game: '',
            score: 0,
            tries: 0,
            blockMap: [],
        },
    */
        {
            playerName: 'Player1',
            passphrase: '123',
            date : '',
            game: '<h2>game data for player <b>ONE</b></h2>',
            score: 1,
            tries: 1,
            blockMap: [],
        },
        {
            playerName: 'Player2',
            passphrase: '123',
            date : '',
            game: '<h2>game data for player <b>TWO</b></h2>',
            score: 2,
            tries: 2,
            blockMap: [],
        },
        {
            playerName: 'Player3',
            passphrase: '123',
            date : '',
            game: '<h2>game data for player <b>THREE</b></h2>',
            score: 3,
            tries: 3,
            blockMap: [],
        },
];

// main();

async function resetHighScoreCollection(client){
    let defaultScores = [];
    for (let i=1; i<=high_score_list_limit; i++) {
        defaultScores.push({name:'player unknown',score:0});
    }
    const result_delete = await client.db(DATABASE_NAME).collection(COLLECTION_NAME).deleteMany({}); // clear database
    console.log(`${result_delete.deletedCount} documents deleted.`);
    const result = await client.db(DATABASE_NAME).collection(COLLECTION_NAME).insertMany(defaultScores);
    console.log(`High Score List Length : ${result.insertedCount}`);
    //console.log(`ID's : ${result.insertedIds}`);
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