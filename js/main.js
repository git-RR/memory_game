
//const mainContent = document.getElementById("mainContent");
//const scoreboard = document.getElementById("scoreboard");

const homeScreenHTML = `
    <button id="btnContinue" class="btn-type-a" hidden>Continue</button>
    <button id="btnNewGame" class="btn-type-a">New Game</button>
    <button id="btnLoad" class="btn-type-a" hidden>Load</button>
    <button id="btnHighScore" class="btn-type-a" hidden>High Score</button>
    <button id="btnOptions" class="btn-type-a">Options</button>
`;

// to change based on screen size
let col = 2;    // 4 easy med hard
let row = 1;   // 4     7    10

const all_blocks = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];      // all possible blocks
let remainingBlocks = [];                       // blocks to be placed
let blockMap = [];                              // placement
let selectedBlocks = [];                        // two blocks chosen
let scoreValue = 0;                             // player's score
const scorePoint = 1;// MAKE CONST                // value added to score on each correct move
let tryValue = 0;                               // number of attempts; to be used in score calc
let blocks = null;
let blocksArr = null;
//let endOfGameFlag = false;
let blockClicked = (event) => {
    const block = event.target.parentNode;
    block.removeEventListener('click', blockClicked);   // same block cannot be selected more than once
    block.children[0].style.opacity = '1';
    console.log(blocksArr.indexOf(block));
    selectedBlocks.push(blocksArr.indexOf(block));
    
    //event.target.style.backgroundColor = "red";         // shows blocks that have been selected

    if(selectedBlocks.length>=2){
        removeBlockEventListeners();                    // prevents more than 2 blocks from being clicked
        checkIfBlocksMatch();
        setTimeout(addBlockEventListeners, 400);
    }

}
const body = document.querySelector('body');
const ScreenTransitionDuration = 400;

homeScreen();

function homeScreen(){

    fadeIn(mainSection);

    scoreboard.innerHTML = `<h1>New Game Name</h1>`;
    scoreboard.classList = "";
    mainContent.style.display = "flex";
    mainContent.style.flexDirection = "column";
    mainContent.style.justifyContent = "center";

    mainContent.innerHTML = homeScreenHTML;

    const btnNewGame = document.getElementById("btnNewGame");
    btnNewGame.addEventListener('click', ()=>{ 
        fadeOut(mainSection);
        setTimeout(()=>{ 
            startGame();
            fadeIn(mainSection);
        } , ScreenTransitionDuration);
    });
    const btnHighScore = document.getElementById("btnHighScore");
    btnHighScore.addEventListener('click', ()=>{ 
        fadeOut(mainSection);
        setTimeout(()=>{ 
            showHighScore();
            fadeIn(mainSection);
        } , ScreenTransitionDuration);
    });
    const btnOptions = document.getElementById("btnOptions");
    btnOptions.addEventListener('click', ()=>{ 
        fadeOut(mainSection);
        setTimeout(()=>{ 
            showOptions();
            fadeIn(mainSection);
        } , ScreenTransitionDuration);
    });
    const btnContinue = document.getElementById("btnContinue");
    btnContinue.addEventListener('click', ()=>{ 
        fadeOut(mainSection);
        setTimeout(()=>{ 
            continueGame();
            fadeIn(mainSection);
        } , ScreenTransitionDuration);
    });
    const btnLoad = document.getElementById("btnLoad");
    btnLoad.addEventListener('click', ()=>{ 
        // fadeOut(mainSection);
        // setTimeout(()=>{ 
            checkAndloadGame();
            // fadeIn(mainSection);
        // } , ScreenTransitionDuration);
    });

    // btnNewGame.click()

    inGameMenu.innerHTML = ``;

    const localSaveGameData = JSON.parse( localStorage.getItem("localSaveGameData") );
    const localUserDetails = getUserDetails();

    if( navigator.onLine ){
        btnLoad.removeAttribute("hidden");
        btnHighScore.removeAttribute("hidden");
    }

    if( localSaveGameData ) {
        btnContinue.removeAttribute("hidden");
    }

    if( localUserDetails ) {
        userLogin.innerHTML = `
            <h1 class="main-heading">
                Player : ${localUserDetails.playerName}
            </h1>
        `;
    } else {

        if( navigator.onLine ){

            userLogin.innerHTML = `
                <button id="btnProfile" class="btn-type-a">
                    Profile
                </button>
            `;
    
            const btnProfile = document.getElementById("btnProfile");
            btnProfile.addEventListener('click', ()=>{ 
                fadeOut(mainSection);
                setTimeout(()=>{ 
                    getPlayerName();
                    
                    btnSubmitPlayerName.addEventListener('click', async ()=>{
                        const successfulLogin = await playerProfile();
    
                        if( successfulLogin ) {
                            setTimeout( () => {
                                homeScreen();
                            }, 2000 );
                        }
    
                    });
                    addEventListenerBtnReturnHome(btnCancelSubmitPlayerName);
    
                    fadeIn(mainSection);
                } , ScreenTransitionDuration);
            });

        } else {
            // do nothing when offline
            // do not show button to register/login
        }

    }

}

let darkMode = false;  // move to localStorage

function showOptions(){
    mainContent.innerHTML = ``;
    mainContent.style.flexDirection = "column";
    scoreboard.innerHTML = `
        <h1>Options Menu</h1>
    `;

    let optionsPage = `
        <div class="row">
            <table class="col-12">
                <tbody style="text-align: center;">
                    <tr>
                        <td>Display Mode</td>
                        <td>
                            <button id="btnOptionModeDark" class="btnOption ${(darkMode)?'clicked':''}">Dark</button>
                            <button id="btnOptionModeLight" class="btnOption ${(darkMode)?'':'clicked'}">Light</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <button id="btnReturnHome" class="btn-type-a">Return</button>
    `;
    mainContent.innerHTML = optionsPage;
    const btnReturnHome = document.getElementById('btnReturnHome');
    addEventListenerBtnReturnHome(btnReturnHome);

    btnOptionModeDark.addEventListener('click', changeMode);
    btnOptionModeLight.addEventListener('click', changeMode);

}

function changeMode(event){
    const btnClicked = event.target;
    // console.log( 'Mode : '+btnClicked );
    if (btnClicked.innerText === 'Dark' ) {
        darkMode = true;
        addDarkModeClass(mainSection);
        addDarkModeClass(document.querySelector('body'));
        btnOptionModeLight.classList.remove('clicked');
    } else if( btnClicked.innerText === 'Light' ) {
        darkMode = false;
        removeDarkModeClass(mainSection);
        removeDarkModeClass(document.querySelector('body'));
        btnOptionModeDark.classList.remove('clicked');
    }
    btnClicked.classList.add('clicked');
    // console.log(btnClicked.classList)
}

function addDarkModeClass(element){
    if(!element.classList.contains('darkMode')){
        element.classList.add('darkMode');
    }
}

function removeDarkModeClass(element){
    if(element.classList.contains('darkMode')){
        element.classList.remove('darkMode');
    }
}

function startGame(){
    mainContent.innerHTML = ``;
    mainContent.style.flexDirection = "row";    
    scoreboard.innerHTML = `
        <h1>Score: <span id="scoreCount"></span></h1>
        <h1>Try: <span id="tryCount"></span></h1>
    `;
    userLogin.innerHTML = ``;
    scoreboard.classList = "in-game-scoreboard";

    //const scoreCount = document.getElementById("scoreCount");
    //const tryCount = document.getElementById("tryCount");
    scoreValue = 0;
    tryValue = 0;

    selectedBlocks = [];                                // reset selection
    
    scoreCount.innerText = scoreValue;
    tryCount.innerText = tryValue;
    
    generateBlockMap();
    displayBlocks();
    
    blocks = document.querySelectorAll(".block");
    blocksArr = Array.from(blocks);                   // or  arr = [...nodeList]
    //console.log(blocks)
    addBlockEventListeners();

    addInGameMenu();
}

function addBlockEventListeners(){
    blocks.forEach((block)=>{
        if (!block.classList.contains('found')) {
            block.addEventListener('click', blockClicked);
        }
    });
}

function removeBlockEventListeners(){
    blocks.forEach((block)=>{
        block.removeEventListener('click', blockClicked);
    });
}

function checkIfBlocksMatch(){
    tryValue++;
    tryCount.innerText = tryValue;

    // autosave game feature
    // prepareSaveGame();
    // saveGameLocal();
    // end autosave game feature

    const block1 = blocks[selectedBlocks[0]];
    const block2 = blocks[selectedBlocks[1]];

    if(blockMap[selectedBlocks[0]]===blockMap[selectedBlocks[1]]){
        // blocks matched
        block1.classList += " found";                   // add class to keep blocks visible
        block2.classList += " found";
        
        scoreValue += scorePoint;
        scoreCount.innerText = scoreValue;
        console.log(`Score: ${scoreValue}`);

        if(document.querySelectorAll(".block.found").length===row*col){              // end of game
            console.log('Well Done!');
            scoreCount.style.color = "red";
            tryCount.style.color = "red";
            //endOfGameFlag = true;
            endGame();
        }
    }else{
        // blocks don't match
        setTimeout(() => {
            block1.querySelector(" :nth-child(1)").style.opacity = '0';
            block2.querySelector(" :nth-child(1)").style.opacity = '0';
            // blocks.forEach((block)=>{
            //     if(!block.classList.contains("found")){
            //         block.querySelector(" :nth-child(1)").style.display = 'none';
            //     }
            // });
        }, 800);
    }

    selectedBlocks = [];                                // reset selection
}

async function endGame(){
    const endGameText = `
        <div id="end-game-screen">
            <h4>
                Well Done!
            </h4>
            <h5 id="message_text" class="loading-text light-text">please wait...</h5>
        </div>
    `;

    setTimeout(()=>{
        mainContent.innerHTML += endGameText;
        btnMenu.setAttribute('hidden', true);
        scoreboard.classList = "";

        setTimeout(()=>{
            if( navigator.onLine ){
                newHighScore();
            } else {
                homeScreen();
            }
        }, 2000); 

    }, 800);

    

    // try{
    //     const sortedScores = await getHighScore();

    //     if(sortedScores.length===0){
    //         throw "getHighScore() returned []";
    //     }

    //     setTimeout(()=>{
    //         if( scoreValue > parseInt(sortedScores[sortedScores.length-1].score) ){
    //             deleteScoreId = sortedScores[sortedScores.length-1]._id  // global variable
    //             getPlayerName();
    //             newPlayerCheckbox.parentNode.style.display = "none";
    //             btnSubmitPlayerName.addEventListener('click', submitHighScore);
    //             addEventListenerBtnReturnHome(btnCancelSubmitPlayerName);
    //         }else{
    //             showHighScore(); // show high scores at end of game
    //         }
    //     }, 2000);

    // } catch (error){
    //     setTimeout(()=>{
    //         homeScreen();
    //     }, 2000); 
    //     console.log(error);
    // }

}

function generateBlockMap(){
    // generate random placement of blocks and place in blockMap

    if(row*col>all_blocks.length*2){
        console.log("Error: row * col > all blocks");
        return
    }

    let allBlockIndex = [];

    for (let k=0; k<all_blocks.length; k++) {
        allBlockIndex.push(k);
    }
    // console.log("block Index:")
    // console.log(allBlockIndex)
    
    for (let j=0; j<row*col/2; j++) {
        let randomBlockIndex = Math.floor(Math.random()*allBlockIndex.length)+0;
        for (let r = 0; r < 2; r++) {
            remainingBlocks.push(all_blocks[allBlockIndex[randomBlockIndex]]);
        }
        allBlockIndex.splice(randomBlockIndex, 1); 
    }
    
    for (let c = 0; c < row*col; c++) {
        let randomBlockIndex = Math.floor(Math.random()*remainingBlocks.length)+0; // 0 to 7 index
        blockMap[c] = remainingBlocks[randomBlockIndex];
        remainingBlocks.splice(randomBlockIndex, 1);          // remove element
    }
    
    // populateArray(row*col/2, allBlockIndex.length, 2, remainingBlocks, allBlockIndex);
    // populateArray(row*col, remainingBlocks.length, 1, blockMap, [])
    // function populateArray(loopLimit, randomLimit, copies, mainArr, indexArr){
    //     let flag = indexArr.length===0?true:false;
    //     console.log("FLAG: "+flag)
    //     for (let j=0; j<loopLimit; j++) {
    //         let randomBlockIndex = Math.floor(Math.random()*randomLimit)+0;
    //         for (let r = 0; r < copies; r++) {
    //             mainArr.push(
    //                 flag?
    //                     remainingBlocks[randomBlockIndex]:
    //                     all_blocks[indexArr[randomBlockIndex]]
    //             );
    //         }
    //         flag?
    //         mainArr.splice(randomBlockIndex, 1):
    //         indexArr.splice(randomBlockIndex, 1);
    //     }
    // }

    // all_blocks.forEach((e)=>{
    //     for (let r = 0; r < 2; r++) {
    //         remainingBlocks.push(e);
    //     }
    // });

    // 2-D array
    // for (let r = 0; r < row; r++) {
    //     blockMap.push([]);
    //     for (let c = 0; c < col; c++) {
    //         let randomBlock = Math.floor(Math.random()*remainingBlocks.length)+0; // 0 to 7 index
    //         blockMap[r][c] = remainingBlocks[randomBlock];
    //         remainingBlocks.splice(randomBlock,1); // remove element
    //     }
    // }
}

function displayBlocks(){
    // mainSection.style.height = "auto"
    // mainContent.style.display = 'block';

    let i = 0;

    for (let r=0; r<row; r++) {
        let rowDisplay = ``;
        rowDisplay += `
            <div class="row"> 
        `;
        for (let c=0; c<col; c++) {
            let block = blockMap[i];
            rowDisplay += `
                <div class="block">
                    <img class="face-img col-1" src="images/face-${block}.png" alt="">
                    <div class="blockArea"></div>
                </div>
            `;
            i++;
        }
        rowDisplay += `
            </div> 
        `;
        mainContent.innerHTML += rowDisplay;
    }

    // blockMap.forEach((block)=>{
    //     mainContent.innerHTML += `
    //         <div class="block">
    //             <img class="face-img" src="images/face-${block}.png" alt="">
    //             <div class="blockArea"></div>
    //         </div>
    //     `;
    // });
    // blockMap.forEach((blockRow)=>{
    //     blockRow.forEach((e)=>{
    //         mainContent.innerHTML += `
    //             <div class="block">
    //                 <img class="face-img" src="images/face-${e}.png" alt="">
    //             </div>
    //         `;
    //     })
    // });

    // debugging
    let str = "";
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            str += blockMap[(r*col)+c] +  " ";
        }
        str += "\n";
    }
    console.log("Block Map:")
    console.log("-----------")
    console.log(str);
    console.log("-----------")
}

// HIGH SCORE BOARD
//showHighScore();


async function showHighScore(){

    mainContent.style.display = "flex";
    mainContent.style.flexDirection = "column";
    mainContent.style.justifyContent = "space-evenly";

    if( navigator.onLine ){ // redundant check
        console.log('ONline');

        mainContent.innerHTML = `
            <h1 class="loading-text">Loading...</h1>
            <button id="btnReturnHome" class="btn-type-a">Return</button>
        `;
        btnReturnHome = document.getElementById("btnReturnHome");
        addEventListenerBtnReturnHome(btnReturnHome);

        try {
            let highSorePage = `
                <div class="row">
                    <table class="col-12">
                        <thead>
                            <tr>
                                <th class="col-6">Player Name</th>
                                <th class="col-6">Score</th>
                            </tr>
                        </thead>
                        <tbody style="text-align: center;">
            `;

            let highScores = await getHighScore();
            //console.log(highScores)

            if(highScores.length===0){
                throw "getHighScore() returned []";
            }

            for(i=0; i<highScores.length; i++){
                highSorePage += `
                    <tr>
                        <td>${highScores[i].playerName}</td>
                        <td>${highScores[i].score}</td>
                    </tr>
                `;
            }

            highSorePage += `
                        </tbody>
                    </table>
                </div>
                <button id="btnReturnHome" class="btn-type-a">Return</button>
            `;
            mainContent.innerHTML = highSorePage;
        } catch (error) {
            mainContent.innerHTML =  `
                <h1>Cannot connect to database.</h1>
                <button id="btnReturnHome" class="btn-type-a">Return</button>
            `;
            console.log(error);
        } finally {
            btnReturnHome = document.getElementById("btnReturnHome");
            addEventListenerBtnReturnHome(btnReturnHome);
        }

    }else{
        console.log('OFFline');

        mainContent.innerHTML = `
            <h1>You're not connected.</h1>
            <button id="btnReturnHome" class="btn-type-a">Return</button>
        `;
        btnReturnHome = document.getElementById("btnReturnHome");
        addEventListenerBtnReturnHome(btnReturnHome);
    } 
    
}

function addEventListenerBtnReturnHome(btnId){
    btnId.addEventListener('click', ()=>{
        fadeOut(mainSection);
        
        const inputs = document.querySelectorAll("input[type='text']");
        inputs.forEach( (input)=>{
            // to prevent input validation message from showing during transition
            input.disabled = true;
        });

        setTimeout(()=>{ 

            homeScreen();

            fadeIn(mainSection);
        } , ScreenTransitionDuration);
    });
}

async function getHighScore(){
    if(navigator.onLine){ // redundant check
        try{
            const response = await fetch("/api/highscore");
            const json = await response.json();
            // console.log(response)
            let sortedScores = [...json];
            console.log(sortedScores);
            // return sortHighScore(json);
            return sortedScores;
        } catch(error){
            console.log(error);
            return [];
        }
    }else{
        return [];
    }
}

// function sortHighScore(scores){
//     let sortedScores = [...scores];
//     for (let i = 0; i < scores.length; i++) {
//         // console.log("i="+i)
//         for (let j = i+1; j < scores.length; j++) {
//             // console.log(sortedScores[i].score+" < "+sortedScores[j].score+" ?")
//             if(parseInt(sortedScores[i].score)<parseInt(sortedScores[j].score)){
//                 // console.log("yes")
//                 let temp = sortedScores[i];
//                 sortedScores[i] = sortedScores[j];
//                 sortedScores[j] = temp;
//             }else{
//                 // console.log("no")
//             }
//         }
//     }
//     // console.log("sorted scores:");
//     // console.log(sortedScores);
//     return sortedScores;
// }

async function newHighScore(){
    const overlayScreen = document.getElementById("end-game-screen");
    overlayScreen.innerHTML = `<h5 id="message_text" class="loading-text light-text">please wait...</h5>`;

    try{
        const sortedScores = await getHighScore();

        if( sortedScores.length === 0 ){
            message_text.innerText = `failed to connect to server.`;
            message_text.classList = '';
            throw "getHighScore() returned []";
        }

        if( scoreValue > parseInt(sortedScores[sortedScores.length-1].score) ){
            // new high score
            // deleteScoreId = sortedScores[sortedScores.length-1]._id  // global variable

            if( getUserDetails() ){
                // user logged in
    
                // showUserFeedback();
                // const message_text = document.getElementById('message_text');
                message_text.innerText = `submitting high score...`;
    
                await submitHighScore();

                setTimeout(()=>{
                    fadeOut(mainSection);
                    setTimeout(()=>{
                        showHighScore();
                        fadeIn(mainSection);
                    }, ScreenTransitionDuration); 
                }, 2000); 
    
            } else {
                // user not logged in
    
                fadeOut(mainSection);
    
                setTimeout(()=>{ 
                    getPlayerName();
    
                    btnSubmitPlayerName.addEventListener('click', async () => {
    
                        const successfulLogin = await playerProfile(); // return null when fail
        
                        if( successfulLogin ) {
                            // user logged in or created new account

                            showUserFeedback();

                            await submitHighScore();

                            setTimeout(()=>{
                                fadeOut(mainSection);
                                setTimeout(()=>{
                                    showHighScore();
                                    fadeIn(mainSection);
                                }, ScreenTransitionDuration); 
                            }, 2000); 

                        } else {
                            btnSubmitPlayerName.disabled = false;
                            return;
                        }
                        
                    });
            
                    btnCancelSubmitPlayerName.addEventListener('click', ()=>{
                        homeScreen();
                    });
    
                    fadeIn(mainSection);
    
                } , ScreenTransitionDuration);
            }
          
        }else{
            // no new high score
            showHighScore();
        }

    } catch (error){
        fadeOut(mainSection);
        setTimeout(()=>{
            homeScreen();
            fadeIn(mainSection);
        }, ScreenTransitionDuration); 
        // console.log(error);
    }

}

// let deleteScoreId = "";

async function submitHighScore(){
    // let player_name = playerName.value; // global 

    const localUserDetails = getUserDetails();

    let newHighScore = {
        playerName: localUserDetails.playerName,
        passphrase: localUserDetails.passphrase,
        score: scoreValue,
    };

    // console.log('DATA SENT TO DATABASE: ')
    // console.log(newHighScore);

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(newHighScore),
    };
    
    const response = await fetch('/api/highscore', options);
    const json = await response.json();

    if( json.data === 10 || json.data === 11 ){
        message_text.innerText = `failed to submit high score.`;
        message_text.classList = '';
    } else {
        message_text.innerText = `high score submitted!`;
        message_text.classList = '';
    }

    // // basic input validation - to be expanded later
    // if( player_name.length>3 && player_name.length<=16 ){
    //     btnSubmitPlayerName.removeEventListener('click', submitHighScore);
    //     // const scores = await getHighScore();
    //     // checkCurrentScore(scoreValue, scores); // moved to endgame()
        
    //     const response = await fetch('/api', options);
    //     const json = await response.json();

    //     console.log(json.data);
    //     showHighScore();                    // show high score list with new high score
    // }

}

function getPlayerName(){
    //get player name
    // mainContent.style.display = "flex";
    // mainContent.style.flexDirection = "column";

    mainContent.innerHTML = `
    <form id="formPlayerData" onsubmit="event.preventDefault();">
        <input id="playerName" type="text" class="inputField" placeholder="Player Name" minlength="3" maxlength="16" required>
        <input id="passphrase" type="text" class="inputField" placeholder="Passphrase" minlength="3" maxlength="16" required>
        <label for="newPlayerCheckbox">
            <input id="newPlayerCheckbox" type="checkbox" name="newPlayerCheckbox" value="newPlayer">
            <span>I'm a new player</span>
        </label>
        <button id="btnSubmitPlayerName" class="btn-type-a">Submit</button>
        <button id="btnCancelSubmitPlayerName" class="btn-type-a">Cancel</button>
    </form>
    `;
    formPlayerData.style.display = "flex";
    formPlayerData.style.flexDirection = "column";
    formPlayerData.style.alignItems = "center";
    // btnSubmitPlayerName.addEventListener('click', submitHighScore);
    // addEventListenerBtnReturnHome(btnCancelSubmitPlayerName);
}

/* async function checkCurrentScore(currentScore, sortedScores){
    // if(currentScore > sortedScores[sortedScores.length-1].score){
    //     // send ID of lowest score to database, to be removed
    //     let deleteScoreId = sortedScores[sortedScores.length-1]._id

    //     let newHighScore = {
    //         name: player_name,
    //         score: currentScore,
    //         id: deleteScoreId       // a new id will be generated by database when new record added
    //     };

    //     // console.log('DATA SENT TO DATABASE: ')
    //     // console.log(newHighScore);

    //     // send currentScore to database
    //     const options = {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(newHighScore),
    //     };

    //     // const response = await fetch('/api', options);
    //     // const json = await response.json();
    //     // console.log(json.data);      // moved to submit()
        
    //     showHighScore(); // refresh high score list
    // }else{
    //     // do nothing
    // }
 }*/

// in game menu

// btnMenu.addEventListener('click', toggleMenu);      // to go in startgame function
// btnContinue.addEventListener('click', toggleMenu);  // to go in startgame function
let flagToggleMenu = false;

function addInGameMenu(){
    // in-game menu

    scoreboard.innerHTML += `<button id="btnMenu"></button>`;
    btnMenu.addEventListener('click', toggleMenu);

    const menu = `
        <div id="menuBg"></div>
        <div id="menuBtnsArea" class="menu-btns">
            <button id="btnContinue" class="btn-type-a">Continue</button>
            <button id="btnSave" class="btn-type-a">Save</button>
            <button id="btnReturnHome" class="btn-type-a">Exit</button>
        </div>
    `;
    inGameMenu.innerHTML = menu;

    menuBg.addEventListener('click', toggleMenu);
    btnContinue.addEventListener('click', toggleMenu);
    btnReturnHome = document.getElementById('btnReturnHome');
    btnReturnHome.addEventListener('click', ()=>{
        flagToggleMenu = true;

        fadeOut(mainSection);
        setTimeout(()=>{ 

            toggleMenu();
            homeScreen();

            fadeIn(mainSection);
        } , ScreenTransitionDuration);

        
    });

    // btnSave.addEventListener('click', saveGame);

    btnSave.addEventListener('click', async ()=>{

        btnSave.disabled = true;

        prepareSaveGame();

        if( navigator.onLine ){
            // allow user to login/register and save game

            if( getUserDetails() ){
                // user logged in
                await saveGame();
    
                setTimeout( () => {
                    returnToGame();
                    toggleMenu();
                }, 2000 );
    
            } else {
                // user not logged in
                getPlayerName();
    
                btnMenu.setAttribute('hidden', true);
        
                btnSubmitPlayerName.addEventListener('click', async () => {
        
                    // btnSubmitPlayerName.disabled = true;
                    const successfulLogin = await playerProfile(); // return null when fail
        
                    if( successfulLogin ) {
                        // user logged in or created new account
    
                        // change screen back to game screen
    
                        // setTimeout( () => {
                        //     returnToGame();
                        //     toggleMenu();

                                // // then save game
                                // await saveGame();
            
                                // // return to game
                                // setTimeout( () => {
                                //     returnToGame();
                                //     toggleMenu();
                                // }, 2000 );

                        // }, 2000 );
    
                        // then save game
                        await saveGame();
    
                        // return to game
                        setTimeout( () => {
                            returnToGame();
                            toggleMenu();
                        }, 2000 );
    
                    } else {
                        btnSubmitPlayerName.disabled = false;
                        return;
                    }
                    
                });
        
                btnCancelSubmitPlayerName.addEventListener('click', ()=>{
                    returnToGame();
                    toggleMenu();
                });
            }


        } else {
            // don't ask for username, only save local

            btnMenu.setAttribute('hidden', true);

            showUserFeedback();

            saveGameLocal();
    
            message_text.innerText = `game saved!`;
            message_text.classList = '';

            // return to game
            setTimeout( () => {
                returnToGame();
                toggleMenu();
            }, 2000 );
        }

    });
}

function toggleMenu(){
    menuBg.style.transition = "background 500ms ease-out";
    if(!flagToggleMenu){
        // show menu
        menuBg.addEventListener('click', toggleMenu);
        setTimeout(()=>{
            menuBg.style.background = "rgba(0,0,0,0.6)";
            menuBg.style.backdropFilter = "blur(5px)";
        }, 500);
        inGameMenu.style.left = "0";
        inGameMenu.style.opacity = "1";

        flagToggleMenu = true;
    }else{
        // hide menu
        menuBg.removeEventListener('click', toggleMenu);
        menuBg.style.background = "rgba(0,0,0,0)";
        // menuBg.style.transition = "";
        inGameMenu.style.opacity = "0";
        setTimeout( ()=>{ inGameMenu.style.left = "200vw"; }, 500 );
        // inGameMenu.style.left = "100vw";

        flagToggleMenu = false;
    }
}

// SAVE GAME (BASIC)

let saveGameData = {
    playerName: '',
    // passphrase: '',
    date : '',
    game: '',
    score: 0,
    tries: 0,
    blockMap: [],
};

let userDetails = {
    playerName: '',
    passphrase: '',
}

async function checkAndloadGame(){
    btnLoad.disabled = true;

    // prepareSaveGame();

    if( navigator.onLine ){
        // allow user to login/register and save game
       
        if( getUserDetails() ){
            // user logged in

            // showUserFeedback();
            // const message_text = document.getElementById('message_text');
            // message_text.innerText = `loading...`;

            await loadGame();

            // setTimeout( () => {
            //     returnToGame();
            //     // toggleMenu();
            // }, 2000 );

        } else {
            // user not logged in

            fadeOut(mainSection);

            setTimeout(()=>{ 
                getPlayerName();

                btnSubmitPlayerName.addEventListener('click', async () => {

                    const successfulLogin = await playerProfile(); // return null when fail
    
                    if( successfulLogin ) {
                        // user logged in or created new account
                        // check for load game
    
                        await loadGame();
    
                    } else {
                        btnSubmitPlayerName.disabled = false;
                        return;
                    }
                    
                });
        
                btnCancelSubmitPlayerName.addEventListener('click', ()=>{
                    // returnToGame();
                    // toggleMenu();
                    homeScreen();
                });

                fadeIn(mainSection);

            } , ScreenTransitionDuration);
    
        }
    } 
    // else {
    //     message_text.innerText = `feature cannot be used when offline`;
    // }
}


async function loadGame(){

    const localUserDetails = getUserDetails();

    showUserFeedback();
    const message_text = document.getElementById('message_text');
    message_text.innerText = `loading...`;

    userDetails.playerName = localUserDetails.playerName;
    userDetails.passphrase = localUserDetails.passphrase;

    let url = "/api/save-game/?";
    url += "playerName="+userDetails.playerName+"&identifier="+userDetails.passphrase;
    url = encodeURI(url);

    const response = await fetch(url);
    const loadedGameData = await response.json();

    if( loadedGameData.data === 08 || loadedGameData.data === 09 ) {
        // 08 - authentication failed; 09 - no game data to load
        // console.log(data.message) // uncomment to check error message
        if( loadedGameData.data === 09 ){
            message_text.innerText = `no previous save data!`;
        } else {
            message_text.innerText = `failed to load game!`;
        }
        message_text.classList = '';

        setTimeout( () => {
            homeScreen();
        }, 2000 );

        return;
    }

    message_text.innerText = `load game completed!`;
    message_text.classList = '';
    
    saveGameData.date       = loadedGameData.date;
    saveGameData.game       = loadedGameData.game;
    saveGameData.score      = loadedGameData.score;
    saveGameData.tries      = loadedGameData.tries;
    saveGameData.blockMap   = [];
    if( loadedGameData.blockMap ){ // redundant check
        loadedGameData.blockMap.forEach(block=>{saveGameData.blockMap.push(block);});
    }

    setTimeout( () => {
        returnToGame();
    }, 2000 );

}


// old load game - required user cred's before each load
// function loadGame(){
//     // load prev save-game

//     // let url = "/api/save-game/?";
//     // let data = {name: 'sakura'};
//     // url.searchParams.append("name",data('name'));
//     // url = encodeURI(url.slice(0, -1));
//     // url += "name"+"="+data.name+"&pwd=12345";

//     // only proceed when navigator.online === true
//     if( navigator.onLine ){
//         getPlayerName();

//         // newPlayerCheckbox.parentNode.setAttribute('hidden', true); // display: flex overrides attribute

//         newPlayerCheckbox.parentNode.style.display = "none";

//         btnSubmitPlayerName.addEventListener('click', async () => {

//             let numberOfInvalidInputs = formPlayerData.querySelectorAll(":invalid").length;
//             if(numberOfInvalidInputs) return;

//             scoreboard.innerHTML = `<h1 class="loading-text">loading...</h1>`;

//             btnSubmitPlayerName.disabled = true;

//             saveGameData.playerName = playerName.value;
//             userDetails.playerName = playerName.value;
//             userDetails.passphrase = passphrase.value;

//             let url = "/api/save-game/?";
//             url += "playerName="+saveGameData.playerName+"&loadGame=1"+"&identifier="+userDetails.passphrase;
//             url = encodeURI(url);
//             const response = await fetch(url);
//             const loadedGameData = await response.json();

//             console.log('LOADED DATA:')
//             console.log(loadedGameData)
//             console.log('------------------------------')
//             // console.log('selected blocks')
//             // console.log(selectedBlocks);

//             // fetch(url)
//             // .then(res => {return res.text();})
//             // .then(txt => {alert(txt);})
//             if( loadedGameData.data === 403 ) { // incorrect input cred's
//                 // alert(loadedGameData.message);
//                 alert('load failed. check details and try again.');
//                 return;
//             }
            
//             if( loadedGameData.data === 404 ) {
//                 console.log(loadedGameData.message);
//             } else{
//                 // console.log(loadedGameData.playerName, loadedGameData.blockMap);
//                 saveGameData.date       = loadedGameData.date;
//                 saveGameData.game       = loadedGameData.game;
//                 saveGameData.score      = loadedGameData.score;
//                 saveGameData.tries      = loadedGameData.tries;
//                 saveGameData.blockMap   = [];
//                 if( loadedGameData.blockMap ){                                          // condition only for test
//                     loadedGameData.blockMap.forEach(block=>{saveGameData.blockMap.push(block);});
//                 }

//                 returnToGame();
//             }
            
//             // put response into local object and call returnToGame
//         });
//         addEventListenerBtnReturnHome(btnCancelSubmitPlayerName);
        
//     } else {
//         mainContent.style.justifyContent = "space-evenly";
//         mainContent.innerHTML = `
//             <h1>You're not connected.</h1>
//             <button id="btnReturnHome" class="btn-type-a">Return</button>
//         `;
//         btnReturnHome = document.getElementById("btnReturnHome");
//         addEventListenerBtnReturnHome(btnReturnHome);
//     }
    

    
// /*
//     if( saveGameData.tries === 0 ) {
//         // start new game
//         alert('no game data to load');
//     } else {
//         // load game
//         mainContent.style.flexDirection = "row";    
//         mainContent.innerHTML = saveGameData.game;
//         scoreboard.innerHTML = `
//             <h1>Score: <span id="scoreCount"></span></h1>
//             <h1>Try: <span id="tryCount"></span></h1>
//         `;

//         scoreValue = saveGameData.score;
//         tryValue = saveGameData.tries;
        
//         scoreCount.innerText = scoreValue;
//         tryCount.innerText = tryValue;

//         blocks = document.querySelectorAll(".block");
//         blocksArr = Array.from(blocks);                   // or  arr = [...nodeList]
//         blockMap = saveGameData.blockMap;
//         blockMap = [];
//         saveGameData.blockMap.forEach(block=>{blockMap.push(block);});
//         //console.log(blocks)
//         addBlockEventListeners();

//         addInGameMenu();

//         alert('game data loaded');
//         console.log(blockMap);
//         console.log(saveGameData.blockMap);
//     }*/
// }

function returnToGame() {
    
    scoreboard.classList = "in-game-scoreboard";

    //if( saveGameData.tries === 0 ) {
        // start new game
        // startGame();
        // alert('no game data to load');
    //} else {
        // load game
        mainContent.style.flexDirection = "row";    
        mainContent.innerHTML = saveGameData.game;
        scoreboard.innerHTML = `
            <h1>Score: <span id="scoreCount"></span></h1>
            <h1>Try: <span id="tryCount"></span></h1>
        `;

        scoreValue = saveGameData.score;
        tryValue = saveGameData.tries;
        
        scoreCount.innerText = scoreValue;
        tryCount.innerText = tryValue;

        blocks = document.querySelectorAll(".block");
        blocksArr = Array.from(blocks);                   // or  arr = [...nodeList]
        blockMap = saveGameData.blockMap;
        blockMap = [];
        saveGameData.blockMap.forEach(block=>{blockMap.push(block);});
        //console.log(blocks)
        addBlockEventListeners();

        addInGameMenu();

        // alert('game data loaded');
        // console.log(blockMap);
        // console.log(saveGameData.blockMap);
    //}
}

function prepareSaveGame() {

    scoreboard.classList = "";

    const date = new Date();
    const saveDate = date.toString().slice(11,15)+'/'+date.getMonth()+'/'+date.getDate();

    document.querySelectorAll('.block').forEach(block=>{
        if(!block.classList.contains("found")){
            // console.log('block selected will be reset before save');
            block.children[0].style.opacity = '0';
        }
    });

    selectedBlocks = []; // reset array

    // save current game and values
    saveGameData.date       = saveDate;
    saveGameData.game       = mainContent.innerHTML;
    saveGameData.score      = parseInt(scoreCount.innerText);
    saveGameData.tries      = parseInt(tryCount.innerText);
    // console.log(blockMap);
    // console.log(saveGameData.blockMap);
    saveGameData.blockMap = [];
    blockMap.forEach(block=>{saveGameData.blockMap.push(block);});
    // for (let i = 0; i < blockMap.length; i++) {
    //     blockMap[i] = saveGameData.blockMap[i];
    // }
    toggleMenu(); // hide in-game menu
}

async function saveGame() {

    // change all scoreboard changes to overlay text changes
    // make overlay first from end game screen

    showUserFeedback();
    // const userFeedback = `
    //     <div id="end-game-screen">
    //         <h5 id="message_text" class="loading-text light-text">please wait...</h5>
    //     </div>
    // `;
    // mainContent.innerHTML += userFeedback;

    saveGameData.playerName = userDetails.playerName;

    saveGameLocal();

    const message_text = document.getElementById('message_text');

    message_text.innerText = `saving...`;
    // scoreboard.innerHTML = `<h1 class="loading-text">saving...</h1>`;

    if( navigator.onLine ){ // this check is redundant (savegame is only called when online)
        // try update first
        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(saveGameData),
        };

        const response = await fetch('/api/save-game', options);
        const json1 = await response.json();

        if( json1.data === 07 ) {
            // update succeeded
            message_text.innerText = `game progress updated!`;
            message_text.classList = '';
            // scoreboard.innerHTML = `<h1 class="">Game Progress Updated!</h1>`;
        } else {
            if ( json1.data === 06 ) {
                // update failed
                // try create
                const options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', },
                    body: JSON.stringify(saveGameData),
                };
    
                const response = await fetch('/api/save-game/', options);
                const json2 = await response.json();

                message_text.innerText = `game saved to cloud!`;
                message_text.classList = '';
                // scoreboard.innerHTML = `<h1 class="">Game Saved To Cloud!</h1>`;
            } else {
                message_text.innerText = `failed to save game.`;
                message_text.classList = '';
                // scoreboard.innerHTML = `<h1 class="">Failed To Save Game.</h1>`;
            }
        }

    } else {
        // not connected - only save local
        message_text.innerText = `game saved!`;
        message_text.classList = '';
        // scoreboard.innerHTML = `<h1 class="">Game Saved!</h1>`;
    }

    // setTimeout( () => {
    //     returnToGame();
    //     toggleMenu();
    // }, 2000 );

    // hide overlay
}


// old saveGame() - required user cred's every time user saves game
// async function saveGame() {
//     let numberOfInvalidInputs = formPlayerData.querySelectorAll(":invalid").length;
//     if(numberOfInvalidInputs) return;

//     saveGameData.playerName = playerName.value;
//     saveGameData.passphrase = passphrase.value;     // passphrase not stored in 'save-game-data' db; in user creds db

//     saveGameLocal();

//     scoreboard.innerHTML = `<h1 class="loading-text">saving...</h1>`;

//     // only proceed from here down when (navigator.onLine === true)

//     if( navigator.onLine ){

//         let newPlayerFlag = newPlayerCheckbox.checked;
//         let foundPlayerNameFlag = false;

//         // check whether playername is taken

//         let url = "/api/save-game/?";
//         url += "playerName"+"="+saveGameData.playerName+"&loadGame=0";
//         url = encodeURI(url);
//         const resData = await fetch(url);
//         const usernameCheck = await resData.json();
//         console.log('Check for username returned: ');
//         console.log(usernameCheck);
//         if( usernameCheck.status === "available" ) {
//             foundPlayerNameFlag = false;
//         } else {
//             foundPlayerNameFlag = true;
//         }


//         if( newPlayerFlag ) {                                       // use 'POST' to create new

//             console.log('trying to create new save game...');

//             if( foundPlayerNameFlag ) {                             // do not proceed; username exists; alert user
//                 alert('that username is taken.');
//                 scoreboard.innerHTML = `<h1 class="">That Username is Taken.</h1>`;
//                 console.log('create failed.');
//                 return; 
//             }

//             // console.log('SAVED DATA:')
//             // console.log(saveGameData)
//             // console.log('------------------------------')

//             // create new save game
//             console.log('POSTING!!')
//             const options = {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', },
//                 body: JSON.stringify(saveGameData),
//             };

//             const response = await fetch('/api/save-game/', options);
//             const json = await response.json();

//             console.log('create successful.')
//             console.log(json.data);

//         } else {                                                    // use 'PUT' to update
            
//             if( !foundPlayerNameFlag ) {                             // do not proceed; username does not exist; alert user
//                 alert('that username is not found.');
//                 scoreboard.innerHTML = `<h1 class="">Username Not Found.</h1>`;
//                 console.log('overwrite failed.')
//                 return;
//             }
//             // console.log('cannot yet update save games!!!');
//             // update existing save game

//             const options = {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json', },
//                 body: JSON.stringify(saveGameData),
//             };

//             const response = await fetch('/api/save-game', options);
//             const json = await response.json();
//             // alert(json.data);
//         }
//         scoreboard.innerHTML = `<h1 class="">Game Saved to Cloud!</h1>`;
//     } else {
//         // not connected - only save local
//         scoreboard.innerHTML = `<h1 class="">Game Saved!</h1>`;
//     }

//     setTimeout( () => {
//         returnToGame();
//         toggleMenu(); // show
//     }, 2000 );
//     // alert('game data saved');

// }

function saveGameLocal() {
    // prepareSaveGame() must be called before saveGameLocal()

    // showUserFeedback();

    localStorage.setItem("localSaveGameData", JSON.stringify(saveGameData));
    console.log('game saved @ '+(new Date()).toString().substring(16,24));
    
    // message_text.innerText = `game saved!`;
    // message_text.classList = '';
}

function continueGame() {
    userLogin.innerHTML = ``;
    console.log('getting data from local storage.');
    saveGameData = JSON.parse( localStorage.getItem("localSaveGameData") );
    returnToGame();
}

function fadeIn(e){
    // console.log(e)
    e.style.transition = `opacity ${ScreenTransitionDuration}ms ease-in`;
    e.style.opacity = "1";
}

function fadeOut(e){
    e.style.transition = `opacity ${ScreenTransitionDuration}ms ease-in`;
    e.style.opacity = "0";
}

async function playerProfile() {

    let numberOfInvalidInputs = formPlayerData.querySelectorAll(":invalid").length;
    if(numberOfInvalidInputs) return;

    btnSubmitPlayerName.disabled = true;

    // btnSubmitPlayerName.removeEventListener('click', playerProfile);

    userDetails.playerName = playerName.value;
    userDetails.passphrase = passphrase.value; 

    scoreboard.innerHTML = `<h1 class="loading-text">Please wait...</h1>`;

    if( navigator.onLine ){ // this check is redundant

        let loginFlag = !(newPlayerCheckbox.checked); // unchecked for existing user

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(
                {
                    playerName : userDetails.playerName,
                    passphrase : userDetails.passphrase,
                    login : loginFlag,
                }
            ),
        };
        console.log('OPTIONS : ', options);
        const response = await fetch('/api/user-cred/', options);
        const json = await response.json();
        console.log(json.status);
        scoreboard.innerHTML = `<h1 class="">${json.status}</h1>`;

        if ( !( json.data === 02 || json.data === 03 ) ) {
            // 02 - new user created
            // 03 - successful login
            return null;
        }
        
        localStorage.setItem("localUserDetails", JSON.stringify(userDetails));
    } else {
        // not connected - only save local
        // scoreboard.innerHTML = `<h1 class="">Player Details Saved!</h1>`;
        // localStorage.setItem("localUserDetails", JSON.stringify(userDetails));

        // do nothing -  this function will not be called when offline
    }

    return true;

    // setTimeout( () => {
    //     homeScreen();
    // }, 2000 );

}

function getUserDetails(){
    // returns null when not found
    return JSON.parse( localStorage.getItem("localUserDetails") );
}

// function (){
//     fadeOut(mainSection);
//     setTimeout(()=>{ 
//         getPlayerName();
        
//         btnSubmitPlayerName.addEventListener('click', playerProfile);
//         addEventListenerBtnReturnHome(btnCancelSubmitPlayerName);

//         fadeIn(mainSection);
//     } , ScreenTransitionDuration);
// }

function showUserFeedback(){
    const userFeedback = `
        <div id="end-game-screen">
            <h5 id="message_text" class="loading-text light-text">please wait...</h5>
        </div>
    `;
    mainContent.innerHTML += userFeedback;
}

