const express = require("express");
// const { sample } = require("underscore");
const {MongoClient, ObjectId} = require("mongodb");
const localFile = require("./env");

const app = express();

const port = process.env.PORT || 5001;

const DATABASE                  = "new_game";
const COLLECTION_HIGHSCORE      = "high-scores";
const COLLECTION_SAVE_DATA      = "save_game_data"; 
const COLLECTION_USER_CREDS     = "user_creds"; 
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

main()

async function main(){
    // const newHighScore = {name:data.name, score:data.score};
    // const id = data.id;

    const password = process.env.DB_PWD || localFile.key;
    const uri = `mongodb+srv://robot-army:${password}@cluster0.cxoh44a.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        // await addNewHighScore(client, newHighScore);
        // await deleteOldHighScore(client, id);
        
        // await resetHighScoreCollection(client);
        // getHighScores(client)
        // const result = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).deleteOne({_id:ObjectId('635befc24379eb3424036f8a')});
        
        // const userCred = await getUserCred( client, 'player1' );
        // console.log('FROM TEST : ');
        // console.log(userCred);


        return client;

    } catch (error) {
        console.error(error)
    }
    // finally{
    //     await client.close(); // client is used elsewhere; will not function if closed here
    // }
}

async function addNewHighScore(client, newHighScore){
	const result = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).insertOne(newHighScore);
	console.log(`New high score added with id: ${result.insertedId}`);
}

async function deleteOldHighScore(client, id){
    const result = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).deleteOne({_id:ObjectId(id)});
    console.log(`${result.deleteCount} document(s) was/were deleted.`)
}

async function getHighScores(client){
	const cursor = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).find({}).sort({score: -1}).limit(high_score_list_limit);
    const result = await cursor.toArray();
    console.log(result);
    return result;
}

/* SAVE GAME */

app.get('/api/save-game', async (request, response)=>{
 
    
    const player_name_query = request.query.playerName;
    const load_game_query = parseInt(request.query.loadGame);
    const identifier_query = request.query.identifier;  // passphrase

    // cloud db
    const client = await main();
    const userCred = getUserCred( client, player_name_query );

    if( userCred.length === 0 ) {
        // did not find user in user db

        if( load_game_query ) {
            // load game
            response.json({data: 404, message: `did not find : ${player_name_query}`});
            console.log(`LOAD-FAILED : did not find : ${player_name_query}`);
            return;
        } else {
            // create new user    
            response.json({data: 403, status:'available'});
            console.log('check result : username is available');
            return;
        }

    } else {
        // user found

        if( !load_game_query ){
            // create new user
            response.json({data: 403, status:'unavailable'});
            console.log('check result : username already exists');
            return;
        } else {
            // load game 

            if( userCred[0].passphrase === identifier_query ){
                // auth successful
                const game_data = getSaveGameData(client, player_name_query);
                response.json(game_data);
            } else {
                // auth failed
                response.json({data: 404, message: `user '${player_name_query}' authentication failed!`});
                console.log(`AUTH-FAILED : did not match : ${player_name_query} passphrase`);
                return;
            }

        }

    }

    /* test code */

    // TODO
    // get username from request
    // check if username in database
    // yes: send save game data back; no: send not found message

    // console.log(request.url);
    // console.log(request.query);

    // let found_player_name = false;
    // let i = -1;
    // let auth_success = false;

    // test_user_db.forEach( ( user ) => {
    //     if( user.playerName === player_name_query ){
    //         if( user.passphrase === identifier_query ){
    //             auth_success = true;
    //             return;
    //         }
    //     }
    // });

    // for( i in test_save_game ){
    //     // console.log(test_save_game[i])
    //     if( test_save_game[i].playerName === player_name_query ){
    //         // response.send("found : "+test_save_game[i].playerName);
    //         //response.json(test_save_game[i]);
    //         //return;
    //         found_player_name = true;
    //         break;
    //     }
    // }

    // if( found_player_name ) {
    //     if( load_game_query && auth_success ) {                 // load game
    //         // response.json(test_save_game[i]);
    //         // console.log('LOAD-SUCCESSFUL : data sent back');
    //         // return;
    //     } else {                                // check to create new user    
    //         response.json({data: 403, status:'unavailable'});
    //         console.log('check result : username already exists');
    //         return;
    //     }
    // } else {
    //     if( load_game_query && auth_success ) {                 // load game
    //         response.json({data: 404, message: `did not find : ${player_name_query}`});
    //         console.log(`LOAD-FAILED : did not find : ${player_name_query}`);
    //         return;
    //     } else {                                // check to create new user    
    //         response.json({data: 403, status:'available'});
    //         console.log('check result : username is available');
    //         return;
    //     }
    // }

   //response.json({data:403 ,message:'login failed. check details and try again.'});
   /* end test code */
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

    //add new user
    test_user_db.push({
        playerName: data.playerName,
        passphrase: data.passphrase,
    })

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
    // console.log('TYPE : ');
    // console.log(typeof(test_save_game));
    // console.log('DATA : ');
    // console.log(test_save_game);
    
    test_save_game.forEach((entry)=>{
        if( entry.playerName === data.playerName ) {

            console.log('old data');
            console.log(entry.playerName);
            console.log(entry.blockMap);

            entry.playerName = data.playerName      // this is not updated; redundant
            entry.passphrase = data.passphrase      // this is not updated; redundant
            entry.date = data.date
            entry.game = data.game
            entry.score = data.score
            entry.tries = data.tries
            entry.blockMap = [];
            data.blockMap.forEach( block=>{ entry.blockMap.push(block) } );

            console.log('new data');
            console.log(entry.playerName);
            console.log(entry.blockMap);

            response.json({data: 'save game updated.'});
            // return; // better to include return after response
        } else {
            // debugging
            console.log(`${entry.playerName} is not ${data.playerName}`);
            // return; // better to include return after response
        }
    });

    // console.log('NEW DATA : ');
    // console.log(test_save_game);


    // test_save_game.push(data);
    // console.log('dummy DB: ')
    // console.log(test_save_game)
    // response.json({data: 'end of PUT'});
    /* end test code */
});

// save game database
async function addNewSaveGameData(client, newSaveGameData){
    // NEW SAVE GAME
	const result = await client.db(DATABASE).collection(COLLECTION_SAVE_DATA).insertOne(newSaveGameData);
	console.log(`New save game added with id: ${result.insertedId}`);
}

async function updateSaveGameData(client, user, new_data){
    // SAVE GAME
    // user = { playerName : 'player1' }
    // new_data = { playerName : 'player1', ... }

    const result = await client.db(DATABASE).collection(COLLECTION_SAVE_DATA).updateOne(user, new_data);
    console.log('1 document updated...');
    console.log(result);
}

async function getSaveGameData(client, player_name){
    // LOAD GAME
	const cursor = await client.db(DATABASE).collection(COLLECTION_SAVE_DATA).findOne({playerName: player_name});
    const result = await cursor.json();
    console.log('loaded game : ');
    console.log(result);
    return result;
}

// user cred's database

async function addNewUser(client, newUserCreds){
    // NEW USER
	const result = await client.db(DATABASE).collection(COLLECTION_USER_CREDS).insertOne(newUserCreds);
	console.log(`New user added with id: ${result.insertedId}`);
}


async function getUserCred(client, player_name){
    // GET USER
	const cursor = await client.db(DATABASE).collection(COLLECTION_USER_CREDS).find({playerName: player_name}).limit(1);
    const result = await cursor.toArray();
    console.log('user found : ');
    console.log(result);
    return result;
}


// end SAVE GAME

function removeDuplicateUser(){
    // TODO:
    // check for duplicate and remove from test db
    // sometimes duplicates show up in db during save game
}

/* test code */

let test_user_db = [
    {
        playerName: 'Player1',
        passphrase: '123',
    },
    {
        playerName: 'Player2',
        passphrase: 'abc',
    },
    {
        playerName: 'Player3',
        passphrase: '!@#',
    },
]

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
            // passphrase: '123',
            date : '',
            game: '<h2>game data for player <b>ONE</b></h2>',
            score: 1,
            tries: 1,
            blockMap: [],
        },
        {
            playerName: 'Player2',
            // passphrase: '123',
            date : '',
            game: '<h2>game data for player <b>TWO</b></h2>',
            score: 2,
            tries: 2,
            blockMap: [],
        },
        {
            playerName: 'Player3',
            // passphrase: '123',
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
    const result_delete = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).deleteMany({}); // clear database
    console.log(`${result_delete.deletedCount} documents deleted.`);
    const result = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).insertMany(defaultScores);
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