
//const mainContent = document.getElementById("mainContent");
//const scoreboard = document.getElementById("scoreboard");

const homeScreenHTML = `
    <button id="btnContinue" class="btn-type-a" hidden>Continue</button>
    <button id="btnNewGame" class="btn-type-a">New Game</button>
    <button id="btnLoad" class="btn-type-a">Load</button>
    <button id="btnHighScore" class="btn-type-a">High Score</button>
    <button id="btnOptions" class="btn-type-a">Options</button>
`;

// to change based on screen size
let col = 4;    // easy med hard
let row = 7;   // 4     7    10

const all_blocks = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];      // all possible blocks
let remainingBlocks = [];                       // blocks to be placed
let blockMap = [];                              // placement
let selectedBlocks = [];                        // two blocks chosen
let scoreValue = 0;                             // player's score
let scorePoint = 0;                             // value added to score on each correct move
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
    const btnLoad = document.getElementById("btnLoad");
    btnLoad.addEventListener('click', ()=>{ 
        fadeOut(mainSection);
        setTimeout(()=>{ 
            loadGame();
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

    // btnNewGame.click()

    inGameMenu.innerHTML = ``;

    const localSaveGameData = JSON.parse( localStorage.getItem("localSaveGameData") );

    if( localSaveGameData ) {
        btnContinue.removeAttribute("hidden");
        userLogin.innerHTML = `
            <h1 class="main-heading">
                User : ${localSaveGameData.playerName}
            </h1>
        `;
    } else {
        // btnContinue.setAttribute("hidden", true);
        userLogin.innerHTML = `
            <button id="" class="btn-type-a">
                Login
            </button>
        `;
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
        <div 
            style="
                position: absolute; top:0; left:0; 
                background-color:rgba(0,0,0,0.7); 
                display: flex; align-items: center; justify-content: center;
                width: 100%; height: 100%; text-align:center;
            "
        >
            <h4 style="color: white; font-size: 6rem;font-family: sans-serif;">
                Well Done!
            </h4>
        </div>
    `;

    setTimeout(()=>{
        mainContent.innerHTML += endGameText;
    }, 800);

    try{
        const sortedScores = await getHighScore();

        if(sortedScores.length===0){
            throw "getHighScore() returned []";
        }

        setTimeout(()=>{
            if( scoreValue > parseInt(sortedScores[sortedScores.length-1].score) ){
                deleteScoreId = sortedScores[sortedScores.length-1]._id  // global variable
                getPlayerName();
                newPlayerCheckbox.parentNode.style.display = "none";
                btnSubmitPlayerName.addEventListener('click', submitHighScore);
                addEventListenerBtnReturnHome(btnCancelSubmitPlayerName);
            }else{
                showHighScore(); // show high scores at end of game
            }
        }, 2000);

    } catch (error){
        setTimeout(()=>{
            homeScreen();
        }, 2000);
        console.log(error);
    }

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

    if( navigator.onLine ){
        console.log('ONline');

        mainContent.innerHTML = `
            <h1>Loading...</h1>
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
                        <td>${highScores[i].name}</td>
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
    if(navigator.onLine){
        try{
            const response = await fetch("/api");
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

let player_name = "";
let deleteScoreId = "";

async function submitHighScore(){
    player_name = playerName.value; // global 

    let newHighScore = {
        name: player_name,
        score: scoreValue,
        id: deleteScoreId,
    };

    // console.log('DATA SENT TO DATABASE: ')
    // console.log(newHighScore);

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(newHighScore),
    };
    
    // basic input validation - to be expanded later
    if( player_name.length>3 && player_name.length<=16 ){
        btnSubmitPlayerName.removeEventListener('click', submitHighScore);
        // const scores = await getHighScore();
        // checkCurrentScore(scoreValue, scores); // moved to endgame()
        
        const response = await fetch('/api', options);
        const json = await response.json();

        console.log(json.data);
        showHighScore();                    // show high score list with new high score
    }

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
    btnSave.addEventListener('click', ()=>{
        prepareSaveGame();
        getPlayerName();

        btnMenu.setAttribute('hidden', true);
        btnSubmitPlayerName.addEventListener('click', ()=>{
            btnSubmitPlayerName.disabled = true;
            saveGame();
        });
        //() => {
            // saveGameData.playerName = playerName.value;
            // saveGame();
            // returnToGame();
            // toggleMenu(); // show
        //});
        // addEventListenerBtnReturnHome(btnCancelSubmitPlayerName);
        btnCancelSubmitPlayerName.addEventListener('click', ()=>{
            returnToGame();
            toggleMenu();
        });
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

function loadGame(){
    // load prev save-game

    // let url = "/api/save-game/?";
    // let data = {name: 'sakura'};
    // url.searchParams.append("name",data('name'));
    // url = encodeURI(url.slice(0, -1));
    // url += "name"+"="+data.name+"&pwd=12345";

    // only proceed when navigator.online === true

    getPlayerName();
    // newPlayerCheckbox.parentNode.setAttribute('hidden', true); // display: flex overrides attribute

    newPlayerCheckbox.parentNode.style.display = "none";

    btnSubmitPlayerName.addEventListener('click', async () => {

        let numberOfInvalidInputs = formPlayerData.querySelectorAll(":invalid").length;
        if(numberOfInvalidInputs) return;

        btnSubmitPlayerName.disabled = true;

        saveGameData.playerName = playerName.value;
        userDetails.playerName = playerName.value;
        userDetails.passphrase = passphrase.value;

        let url = "/api/save-game/?";
        url += "playerName="+saveGameData.playerName+"&loadGame=1"+"&identifier="+userDetails.passphrase;
        url = encodeURI(url);
        const response = await fetch(url);
        const loadedGameData = await response.json();

        console.log('LOADED DATA:')
        console.log(loadedGameData)
        console.log('------------------------------')
        // console.log('selected blocks')
        // console.log(selectedBlocks);

        // fetch(url)
        // .then(res => {return res.text();})
        // .then(txt => {alert(txt);})
        if( loadedGameData.data === 403 ) { // incorrect input cred's
            // alert(loadedGameData.message);
            alert('load failed. check details and try again.');
            return;
        }
        
        if( loadedGameData.data === 404 ) {
            console.log(loadedGameData.message);
        } else{
            // console.log(loadedGameData.playerName, loadedGameData.blockMap);
            saveGameData.date       = loadedGameData.date;
            saveGameData.game       = loadedGameData.game;
            saveGameData.score      = loadedGameData.score;
            saveGameData.tries      = loadedGameData.tries;
            saveGameData.blockMap   = [];
            if( loadedGameData.blockMap ){                                          // condition only for test
                loadedGameData.blockMap.forEach(block=>{saveGameData.blockMap.push(block);});
            }

            returnToGame();
        }
        
        // put response into local object and call returnToGame
    });
    addEventListenerBtnReturnHome(btnCancelSubmitPlayerName);

    
/*
    if( saveGameData.tries === 0 ) {
        // start new game
        alert('no game data to load');
    } else {
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

        alert('game data loaded');
        console.log(blockMap);
        console.log(saveGameData.blockMap);
    }*/
}

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
    let numberOfInvalidInputs = formPlayerData.querySelectorAll(":invalid").length;
    if(numberOfInvalidInputs) return;

    saveGameData.playerName = playerName.value;
    saveGameData.passphrase = passphrase.value;     // passphrase not stored in 'save-game-data' db; in user creds db

    saveGameLocal();

    // only proceed from here down when (navigator.onLine === true)

    let newPlayerFlag = newPlayerCheckbox.checked;
    let foundPlayerNameFlag = false;

    // check whether playername is taken

    let url = "/api/save-game/?";
    url += "playerName"+"="+saveGameData.playerName+"&loadGame=0";
    url = encodeURI(url);
    const resData = await fetch(url);
    const usernameCheck = await resData.json();
    console.log('Check for username returned: ');
    console.log(usernameCheck);
    if( usernameCheck.status === "available" ) {
        foundPlayerNameFlag = false;
    } else {
        foundPlayerNameFlag = true;
    }


    if( newPlayerFlag ) {                                       // use 'POST' to create new

        console.log('trying to create new save game...');

        if( foundPlayerNameFlag ) {                             // do not proceed; username exists; alert user
            alert('that username is taken.');
            console.log('create failed.');
            return; 
        }

        // console.log('SAVED DATA:')
        // console.log(saveGameData)
        // console.log('------------------------------')

        // create new save game
        console.log('POSTING!!')
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(saveGameData),
        };

        const response = await fetch('/api/save-game/', options);
        const json = await response.json();

        console.log('create successful.')
        console.log(json.data);

    } else {                                                    // use 'PUT' to update
        
        if( !foundPlayerNameFlag ) {                             // do not proceed; username does not exist; alert user
            alert('that username is not found.');
            console.log('overwrite failed.')
            return;
        }
        // console.log('cannot yet update save games!!!');
        // update existing save game

        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(saveGameData),
        };

        const response = await fetch('/api/save-game', options);
        const json = await response.json();
        alert(json.data);
    }

    returnToGame();
    toggleMenu(); // show
    alert('game data saved');

}

function saveGameLocal() {
    // prepareSaveGame() must be called before saveGameLocal()
    localStorage.setItem("localSaveGameData", JSON.stringify(saveGameData));
    console.log('game saved @ '+(new Date()).toString().substring(16,24));
}

function continueGame() {
    userLogin.innerHTML = ``;
    console.log('getting data from local storage.');
    saveGameData = JSON.parse( localStorage.getItem("localSaveGameData") );
    returnToGame();
}

function fadeIn(e){
    console.log(e)
    e.style.transition = `opacity ${ScreenTransitionDuration}ms ease-in`;
    e.style.opacity = "1";
}

function fadeOut(e){
    e.style.transition = `opacity ${ScreenTransitionDuration}ms ease-in`;
    e.style.opacity = "0";
}