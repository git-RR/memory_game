const express = require("express");
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

async function main(){
    const password = process.env.DB_PWD || localFile.key;
    const uri = `mongodb+srv://robot-army:${password}@cluster0.cxoh44a.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        return client;
    } catch (error) {
        console.error(error);           // debug
    }
}

/*** USER SIGN-UP/IN ***/

app.post("/api/user-cred", async (request, response)=>{
    // create new user

    const data = request.body;

    const encryptionKey = Math.floor(Math.random() * (61 + 61 + 1)) - 61; //(max - min + 1)) + min

    const newUserCred = {
        playerName: data.playerName,
        passphrase: data.passphrase,
        encryptionKey : encryptionKey,
    };

    const loginFlag = (data.login);
    const client = await main();
    const userCred = await getUserCred( client, data.playerName );

    if( userCred === null ) {
        // not found

        if( loginFlag ) {
            // trying to log in
            response.json({data: 01, status:'Login Failed.'});
        } else {
            // trying to create new user
            await addNewUser(client, newUserCred);
            response.json({
                data: 02, 
                status:'New User Created.', 
                passphrase: encrypt(newUserCred.passphrase, newUserCred.encryptionKey),
            });
        }

    } else {
        // found

        if( loginFlag ) {
            // trying to log in

            if( userCred.passphrase === newUserCred.passphrase ){
                // passphrase matched
                response.json({
                    data: 03, 
                    status:'Login Succeeded.',
                    passphrase: encrypt(userCred.passphrase, userCred.encryptionKey),
                });

            } else {
                // passphrase mismatch
                response.json({data: 04, status:'Login Failed.'});
            }
            
        } else {
            // trying to create new user
            response.json({data: 05, status:'Username is Taken.'});
        }
    }
    
    return;
});

async function addNewUser(client, newUserCreds){
	const result = await client.db(DATABASE).collection(COLLECTION_USER_CREDS).insertOne(newUserCreds);
	// console.log(`New user added with id: ${result.insertedId}`);             // debug
}

async function getUserCred(client, player_name){
	const result = await client.db(DATABASE).collection(COLLECTION_USER_CREDS).findOne({playerName: player_name});
    return result;
}

/*** HIGH SCORE ***/

app.get('/api/highscore', async (request, response)=>{
    const client = await main();
	const result = await getHighScores(client);
    response.json(result);
});

app.post("/api/highscore", async (request, response)=>{
    const data = request.body;
    const newHighScore = { playerName: data.playerName, score: data.score };
    const client = await main();
    
    const allHighScores = await getHighScores(client);
    const deleteId = allHighScores[allHighScores.length-1]._id

    const userCred = await getUserCred(client, data.playerName);

    if( userCred !== null ){
        // user found
        if( userCred.passphrase === decrypt(data.passphrase, userCred.passphrase.length, userCred.encryptionKey) ){
            // passphrase matched
            await addNewHighScore(client, newHighScore);
            await deleteOldHighScore(client, deleteId);
            // console.log(`added new high score : ${newHighScore}`);   // debug
            // console.log(`deleted high score : ${deleteId}`);         // debug
            response.json({data: 12, message: `High Score Submitted.`});
        } else {
            // passphrase does not match
            // console.log(`failed to authenticate`);                   // debug
            response.json({data: 10, message: `Failed To Authenticate. Aborted High Score Submit.`});
        }
    } else {
        // user not found
        // console.log(`user not found`);                               // debug
        response.json({data: 11, message: `User Not Found. Aborted High Score Submit.`});
    }

    return;
});

async function addNewHighScore(client, newHighScore){
	const result = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).insertOne(newHighScore);
	// console.log(`New high score added with id: ${result.insertedId}`);       // debug
}

async function deleteOldHighScore(client, id){
    const result = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).deleteOne({_id:ObjectId(id)});
    // console.log(`${result.deleteCount} document(s) was/were deleted.`);      // debug
}

async function getHighScores(client){
	const cursor = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).find({}).sort({score: -1}).limit(high_score_list_limit);
    const result = await cursor.toArray();
    // console.log(result);             // debug
    return result;
}

/*** SAVE GAME ***/

app.get('/api/save-game', async (request, response)=>{
    // load game

    const player_name_query = request.query.playerName;
    const client = await main();
    const userCred = await getUserCred( client, player_name_query );

    if( userCred.passphrase === decrypt(request.query.identifier, userCred.passphrase.length, userCred.encryptionKey) ){
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
});

app.post("/api/save-game", async (request, response)=>{
    // new save game

    const data = request.body;

    const newSaveGame = {
        playerName: data.playerName,
        date : data.date,
        game: data.game,
        score: data.score,
        tries: data.tries,
        blockMap: data.blockMap,
    };

    const client = await main();
    const userCred = await getUserCred( client, newSaveGame.playerName );

    if( userCred.passphrase === decrypt(data.passphrase, userCred.passphrase.length, userCred.encryptionKey) ){
        // auth successful
        await addNewSaveGameData(client, newSaveGame);
        response.json({data: 'game saved!'});
    }else{
        console.log('Auth Failed @ post save game');
    }

});

app.put("/api/save-game", async (request, response)=>{
    // update save game

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

    if( userCred.passphrase === decrypt(data.passphrase, userCred.passphrase.length, userCred.encryptionKey) ){
        // auth successful
        const result = await updateSaveGameData( client, { playerName : data.playerName }, updatedSaveData );
        
        if( result.matchedCount || result.modifiedCount ) {
            response.json({ data: 07, message: 'Update Succeeded.' });
        } else {
            response.json({ data: 06, message: 'Update Failed.' });
        }
    }else{
        console.log('Auth Failed @ put save game');
    }
});

async function addNewSaveGameData(client, newSaveGameData){
	const result = await client.db(DATABASE).collection(COLLECTION_SAVE_DATA).insertOne(newSaveGameData);
	// console.log(`New save game added with id: ${result.insertedId}`);        // debug
}

async function updateSaveGameData(client, user, new_data){
    const result = await client.db(DATABASE).collection(COLLECTION_SAVE_DATA).updateOne(user, new_data);
    return result;
}

async function getSaveGameData(client, player_name){
	const result = await client.db(DATABASE).collection(COLLECTION_SAVE_DATA).findOne({playerName: player_name});
    return result;
}

/*** ENCRYPTION ***/

const chars = "lwZ9Mn0f2tbXLpCK3VNcRBqvJgx4mGHeju6S7ar5DoAyYFT8UkdWzEOsihPQ1I";

function encrypt(pwd, encryptionKey){
    const maxLen = 20;

    let randomIndex = 0;

    let encryptedPwd = pwd;

    // add two random char's to start of pwd
    for (let i = 0; i < 2; i++) {
        randomIndex = Math.floor(Math.random() * (chars.length));
        encryptedPwd = chars[randomIndex] + encryptedPwd;  
    }

    // add two random char's to end of pwd
    for (let i = 0; i < 2; i++) {
        randomIndex = Math.floor(Math.random() * (chars.length));
        encryptedPwd += chars[randomIndex];  
    }

    // keep adding until pwd is 20 char's long
    while( encryptedPwd.length < maxLen ){
        randomIndex = Math.floor(Math.random() * (chars.length));
        encryptedPwd += chars[randomIndex];
    }

    const encryptArr = [...encryptedPwd];

    let index = 0;
    // substitution cypher
    for(let j = 0; j < maxLen; j++){
        index = chars.indexOf(encryptArr[j]);
        index += encryptionKey;
        if( index > chars.length-1 ){
            index -= chars.length;
        }
        if( index < 0 ){
            index += chars.length;
        }
        // console.log(encryptArr[j]+"==>"+chars[index]);           // debug
        encryptArr[j] = chars[index];
    }

    encryptedPwd = '';

    for( let i=0;i<encryptArr.length;i++ ){
        encryptedPwd +=encryptArr[i];
    }

    return encryptedPwd;
}

function decrypt(encryptedPwd, pwdLength, encryptionKey){

    let decryptedPwd = encryptedPwd.substr(2, pwdLength);

    const decryptArr = [...decryptedPwd];

    let index = 0;
    // reverse substitution cypher
    for(let j = 0; j < decryptArr.length; j++){
        index = chars.indexOf(decryptArr[j]);
        index -= encryptionKey;
        if( index < 0 ){
            index += chars.length;
        }
        if( index > chars.length-1 ){
            index -= chars.length;
        }
        // console.log(decryptArr[j]+"==>"+chars[index]);       // debug
        decryptArr[j] = chars[index];
    }

    decryptedPwd = '';

    for( let i=0; i<decryptArr.length; i++ ){
        decryptedPwd += decryptArr[i];
    }

    return decryptedPwd;
}


/*** DEV FUNCTIONS ***/

async function resetHighScoreCollection(client){
    let defaultScores = [];
    for (let i=1; i<=high_score_list_limit; i++) {
        defaultScores.push({playerName:'player unknown',score:0});
    }
    const result_delete = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).deleteMany({}); // clear database
    const result = await client.db(DATABASE).collection(COLLECTION_HIGHSCORE).insertMany(defaultScores);
}

async function clearAllSaveGameData(client){
    const result_delete1 = await client.db(DATABASE).collection(COLLECTION_SAVE_DATA).deleteMany({});
    const result_delete2 = await client.db(DATABASE).collection(COLLECTION_USER_CREDS).deleteMany({});
}

async function getAllSaveGameData(client){
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

