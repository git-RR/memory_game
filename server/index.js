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

app.get('/api/highscore', async (request, response)=>{
    const client = await main();
	const result = await getHighScores(client);
    //response.json(sample_data)
    console.log("---GET---");
    // console.log(result);
    // console.log("------")
    response.json(result);
});

app.post("/api/highscore", async (request, response)=>{
    const data = request.body;
    const newHighScore = { playerName: data.playerName, score: data.score };
    // const id = data.id;
    const client = await main();
    
    const allHighScores = await getHighScores(client);
    const deleteId = allHighScores[allHighScores.length-1]._id

    const userCred = await getUserCred(client, data.playerName);
    console.log("---POST---");

    if( userCred !== null ){
        // user found
        if( userCred.passphrase === decrypt(data.passphrase) ){
            // match
            await addNewHighScore(client, newHighScore);
            await deleteOldHighScore(client, deleteId);
            console.log(`added new high score : ${newHighScore}`);
            console.log(`deleted high score : ${deleteId}`);
            response.json({data: 12, message: `High Score Submitted.`});
        } else {
            // do not match
            response.json({data: 10, message: `Failed To Authenticate. Aborted High Score Submit.`});
            console.log(`failed to authenticate`)
        }
    } else {
        // user not found
        response.json({data: 11, message: `User Not Found. Aborted High Score Submit.`});
        console.log(`user not found`)

    }

    return;

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
    // response.json({data: 'high score list updated!'});
    /* end test code */
});

// main()

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

        // for(i=1;i<4;i++){
        //         //add sample data
        //     await addNewUser(client, {playerName: `play${i}`, passphrase: '123' });
        // }

        //const result_delete2 = await client.db(DATABASE).collection(COLLECTION_USER_CREDS).deleteMany({});
        //console.log(result_delete2);

        // clearAllSaveGameData(client);


        await getAllSaveGameData(client);

        // const result = await updateSaveGameData(client, { playerName : 'play1'}, 	{$set:{
        //     date        : '11/11/23',
        //     tries       : 22,
        //     score       : 12,
        //     game        : `game data for ${this.playerName}`
        // }});

        // console.log('Matched Count : ');
        // console.log(result.matchedCount);
        // console.log('Modified Count : ');
        // console.log(result.modifiedCount);

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
    // const load_game_query = parseInt(request.query.loadGame);
    // const identifier_query = request.query.identifier;  // passphrase
    const identifier_query = decrypt(request.query.identifier);      //  decrypt here


    // cloud db
    const client = await main();
    const userCred = await getUserCred( client, player_name_query );

    if( userCred.passphrase === identifier_query ){
        // auth successful
        const game_data = await getSaveGameData(client, player_name_query);
        if( game_data === null ){
            response.json({data: 09, message: `Failed To Load Game. No Game Data.`});
        } else {
            response.json(game_data);
        }
    } else {
        response.json({data: 08, message: `Failed To Authenticate. Load Aborted.`});
    }
    return;

    // old code; did player auth here

    // if( userCred === null ) {
    //     // did not find user in user db

    //     if( load_game_query ) {
    //         // load game
    //         response.json({data: 404, message: `did not find : ${player_name_query}`});
    //         console.log(`LOAD-FAILED : did not find : ${player_name_query}`);
    //         return;
    //     } else {
    //         // create new user    
    //         response.json({data: 403, status:'available'});
    //         console.log('check result : username is available');
    //         return;
    //     }

    // } else {
    //     // user found

    //     if( !load_game_query ){
    //         // create new user
    //         response.json({data: 403, status:'unavailable'});
    //         console.log('check result : username already exists');
    //         return;
    //     } else {
    //         // load game 

    //         if( userCred.passphrase === identifier_query ){
    //             // auth successful
    //             const game_data = await getSaveGameData(client, player_name_query);
    //             response.json(game_data);
    //         } else {
    //             // auth failed
    //             response.json({data: 404, message: `user '${player_name_query}' authentication failed!`});
    //             console.log(`AUTH-FAILED : did not match : ${player_name_query} passphrase`);
    //             return;
    //         }

    //     }

    // }

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

    const newSaveGame = {
        playerName: data.playerName,
        date : data.date,
        game: data.game,
        score: data.score,
        tries: data.tries,
        blockMap: data.blockMap,
    };

    // const newUserCred = {
    //     playerName: data.playerName,
    //     passphrase: data.passphrase,
    // };

    // cloud db
    const client = await main();
    const userCred = await getUserCred( client, newSaveGame.playerName );

    if( userCred.passphrase === decrypt(data.passphrase) ){
        // auth successful
        await addNewSaveGameData(client, newSaveGame);
        response.json({data: 'game saved!'});
    }else{
        console.log('Auth Failed @ post save game');
    }


    // await addNewUser(client, newUserCred); // removed since create user is handled by .post(user-cred)

    /* get result to check if this succeeded? */




    // TODO 
    // check whether user has saved game before; 
    // yes: update; no: create new save game

    /* start test code */

    // console.log('New Save Game:');
    // console.log(data.playerName);

    // test_save_game.push(data);

    // //add new user
    // test_user_db.push({
    //     playerName: data.playerName,
    //     passphrase: data.passphrase,
    // })

    // console.log('dummy DB: ')
    // console.log(test_save_game)
    // response.json({data: 'game saved!'});
    /* end test code */
});

app.put("/api/save-game", async (request, response)=>{
    const data = request.body;

    const updatedSaveData = {
        $set:{
            date : data.date,
            game : data.game,
            score : data.score,
            tries : data.tries,
            blockMap : data.blockMap,
        }
    }
    
    const client = await main();
    const userCred = await getUserCred( client, data.playerName );

    if( userCred.passphrase === decrypt(data.passphrase) ){
        // auth successful
        const result = await updateSaveGameData( client, { playerName : data.playerName }, updatedSaveData );
        // response.json({data: 'save game updated.'});
        
        /* check if this fails and send back error code. */

        if( result.matchedCount || result.modifiedCount ) {
            response.json({data: 07, message: 'Update Succeeded.' });
        } else {
            response.json({data: 06, message: 'Update Failed.' });
        }

        console.log('Matched Count : ');
        console.log(result.matchedCount);
        console.log('Modified Count : ');
        console.log(result.modifiedCount);
    }else{
        console.log('Auth Failed @ put save game');
    }

    

    // if( result === null ){
    //     response.json({data: 06, message: 'Update Failed.' });
    // } else {
    //     response.json({data: 07, message: 'Update Succeeded.' });
    // }
    
    
    
    /* start test code */

    // console.log('Updating Save Game:');
    // console.log(data.playerName);
    // console.log('TYPE : ');
    // console.log(typeof(test_save_game));
    // console.log('DATA : ');
    // console.log(test_save_game);
    
    // test_save_game.forEach((entry)=>{
    //     if( entry.playerName === data.playerName ) {

    //         console.log('old data');
    //         console.log(entry.playerName);
    //         console.log(entry.blockMap);

    //         entry.playerName = data.playerName      // this is not updated; redundant
    //         entry.passphrase = data.passphrase      // this is not updated; redundant
    //         entry.date = data.date
    //         entry.game = data.game
    //         entry.score = data.score
    //         entry.tries = data.tries
    //         entry.blockMap = [];
    //         data.blockMap.forEach( block=>{ entry.blockMap.push(block) } );

    //         console.log('new data');
    //         console.log(entry.playerName);
    //         console.log(entry.blockMap);

    //         response.json({data: 'save game updated.'});
    //         // return; // better to include return after response
    //     } else {
    //         // debugging
    //         console.log(`${entry.playerName} is not ${data.playerName}`);
    //         // return; // better to include return after response
    //     }
    // });

    // console.log('NEW DATA : ');
    // console.log(test_save_game);


    // test_save_game.push(data);
    // console.log('dummy DB: ')
    // console.log(test_save_game)
    // response.json({data: 'end of PUT'});
    /* end test code */
});

app.post("/api/user-cred", async (request, response)=>{
    const data = request.body;

    const newUserCred = {
        playerName: data.playerName,
        passphrase: data.passphrase,  // do not decrypt here; passphrase may come from form
    };

    const loginFlag = (data.login);

    const client = await main();
    
    // get user
    const userCred = await getUserCred( client, data.playerName );

    console.log(data);

    // check incoming cred's
    
    console.log("_____________________");
    console.log(`check for ${ data.playerName }`);

    if( userCred === null ) {
        // not found
        if( loginFlag ) {
            // trying to log in
            console.log('Login Failed : User Not Found');
            response.json({data: 01, status:'Login Failed.'});
        } else {
            // trying to create new user
            await addNewUser(client, newUserCred);
            console.log('New User Created.')
            response.json({
                data: 02, 
                status:'New User Created.', 
                passphrase: encrypt(newUserCred.passphrase),        // send encrypted version here
            });
            console.log('Encrypted Pwd : '+encrypt(newUserCred.passphrase))
        }
    } else {
        // found
        if( loginFlag ) {
            // trying to log in
            
            // newUserCred.passphrase = decrypt(newUserCred.passphrase);       // dont decrypt before check; input from user

            if( userCred.passphrase === newUserCred.passphrase ){
                // passphrase match
                console.log('Login Succeeded.');
                response.json({
                    data: 03, 
                    status:'Login Succeeded.',
                    passphrase: encrypt(newUserCred.passphrase),        // send encrypted version here
                });
                console.log('Encrypted Pwd : '+encrypt(newUserCred.passphrase))
            } else {
                // passphrase mismatch
                console.log('Login Failed. Check Passphrase.');
                response.json({data: 04, status:'Login Failed.'});
            }
            
        } else {
            // trying to create new user
            console.log('New User Not Created : Username is taken.');
            response.json({data: 05, status:'Username is Taken.'});
        }
    }

    console.log("_____________________");
    
    return;
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
    // console.log('1 document updated...');
    // console.log(result);
    return result;
}

async function getSaveGameData(client, player_name){
    // LOAD GAME
	const result = await client.db(DATABASE).collection(COLLECTION_SAVE_DATA).findOne({playerName: player_name});
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
	const result = await client.db(DATABASE).collection(COLLECTION_USER_CREDS).findOne({playerName: player_name});
    console.log('user found : ');
    console.log(result);
    return result;
}

/* ENCRYPTION */

function encrypt(pwd){
    // pwd is unencrypted
    // length : 3-16 char's
    // encrypted pwd length = 20 char's
    const maxLen = 20;
    //const charSet = "lwZ9M{)@n0(f2tbX>!/Lp<CK*]$.?,3_VNcRB#%}qvJgx4&mGH-eju6[S;7ar5D=oAy^YFT8Ukd+WzEOsihPQI";
    const charSet = "lwZ9Mn0f2tbXLpCK3VNcRBqvJgx4mGHeju6S7ar5DoAyYFT8UkdWzEOsihPQI";

    let randomIndex = Math.floor(Math.random() * (charSet.length));

    let encryptedPwd = pwd;

    for (let i = 0; i < 2; i++) {
        randomIndex = Math.floor(Math.random() * (charSet.length));
        encryptedPwd = charSet[randomIndex] + encryptedPwd;  
    }
    for (let i = 0; i < 2; i++) {
        randomIndex = Math.floor(Math.random() * (charSet.length));
        encryptedPwd += charSet[randomIndex];  
    }

    while( encryptedPwd.length<20 ){
        randomIndex = Math.floor(Math.random() * (charSet.length));
        encryptedPwd += charSet[randomIndex];
    }

    return encryptedPwd;
}

function decrypt(encryptedPwd, pwdLength){
    let decryptedPwd = encryptedPwd.substr(2, pwdLength);
    return decryptedPwd;
}

// end SAVE GAME

function removeDuplicateUser(){
    // TODO:
    // check for duplicate and remove from test db
    // sometimes duplicates show up in db during save game
}

// dev functions

async function resetHighScoreCollection(client){
    let defaultScores = [];
    for (let i=1; i<=high_score_list_limit; i++) {
        defaultScores.push({playerName:'player unknown',score:0});
    }
    const result_delete = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).deleteMany({}); // clear database
    console.log(`${result_delete.deletedCount} documents deleted.`);
    const result = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).insertMany(defaultScores);
    console.log(`High Score List Length : ${result.insertedCount}`);
    //console.log(`ID's : ${result.insertedIds}`);
}

async function clearAllSaveGameData(client){
    // clear
    const result_delete1 = await client.db(DATABASE).collection(COLLECTION_SAVE_DATA).deleteMany({});
    const result_delete2 = await client.db(DATABASE).collection(COLLECTION_USER_CREDS).deleteMany({});
}

async function getAllSaveGameData(client){
   // Check databases
   const result1 = await client.db(DATABASE).collection(COLLECTION_SAVE_DATA).find({});
   const result2 = await client.db(DATABASE).collection(COLLECTION_USER_CREDS).find({});
   const db1 = await result1.toArray();
   const db2 = await result2.toArray();
   console.log("STATE OF DB's");
   
   db1.forEach(value => {
        console.log('player name : ',value.playerName);
        console.log('date : ', value.date);
        console.log('tries : ', value.tries);
        console.log('score : ', value.score);
   });
   console.log(db2);
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

/* end test code */