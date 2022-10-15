
//const mainContent = document.getElementById("mainContent");
//const scoreboard = document.getElementById("scoreboard");

const homeScreenHTML = `
    <button id="btnNewGame" class="btn-type-a">New Game</button>
    <button class="btn-type-a">Load</button>
    <button class="btn-type-a">Options</button>
`;


// to change based on screen size
let col = 6;
let row = 2;

const all_blocks = [1,2,3,4,5,6,7,8,9,10];    // all possible blocks
let remainingBlocks = [];                // blocks to be placed
let blockMap = [];                       // placement
let selectedBlocks = [];                 // two blocks chosen
let scoreValue = 0;
let scorePoint = 1;
let tryValue = 0;
let blocks = null;
let blocksArr = null;
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

homeScreen();

function homeScreen(){
    scoreboard.innerHTML = `<h1>New Game Name</h1>`;
    mainContent.innerHTML = homeScreenHTML;
    const btnNewGame = document.getElementById("btnNewGame");
    btnNewGame.addEventListener('click', startGame);
    // btnNewGame.click()
}


function startGame(){
    mainContent.innerHTML = ``;
    mainContent.style.flexDirection = "row";    
    scoreboard.innerHTML = `
        <h1>Score: <span id="scoreCount"></span></h1>
        <h1>Try: <span id="tryCount"></span></h1>
    `;

    //const scoreCount = document.getElementById("scoreCount");
    //const tryCount = document.getElementById("tryCount");
    scoreValue = 0;
    tryValue = 0;
    
    scoreCount.innerText = scoreValue;
    tryCount.innerText = tryValue;
    
    generateBlockMap();
    displayBlocks();
    
    blocks = document.querySelectorAll(".block");
    blocksArr = Array.from(blocks);                   // or  arr = [...nodeList]
    //console.log(blocks)
    addBlockEventListeners();
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

    const block1 = blocks[selectedBlocks[0]];
    const block2 = blocks[selectedBlocks[1]];

    if(blockMap[selectedBlocks[0]]===blockMap[selectedBlocks[1]]){
        // blocks matched
        block1.classList += " found";                   // add class to keep blocks visible
        block2.classList += " found";
        
        scoreValue += scorePoint;
        scoreCount.innerText = scoreValue;
        console.log(`Score: ${scoreValue}`);
        console.log("current state: ")

        if(document.querySelectorAll(".block.found").length===row*col){              // end of game
            console.log('Well Done!');
            scoreCount.style.color = "red";
            tryCount.style.color = "red";
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

function generateBlockMap(){
    // generate random placement of blocks and place in blockMap

    if(row*col>=all_blocks.length*2){
        console.log("Error: row * col > all blocks");
        return
    }

    for (let j=0; j<row*col/2; j++) {
        for (let r = 0; r < 2; r++) {
            remainingBlocks.push(all_blocks[j]);
        }
        
    }

    // all_blocks.forEach((e)=>{
    //     for (let r = 0; r < 2; r++) {
    //         remainingBlocks.push(e);
    //     }
    // });
    
        for (let c = 0; c < row*col; c++) {
            let randomBlock = Math.floor(Math.random()*remainingBlocks.length)+0; // 0 to 7 index
            blockMap[c] = remainingBlocks[randomBlock];
            remainingBlocks.splice(randomBlock, 1);          // remove element
        }

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
    mainSection.style.height = "auto"
    mainContent.style.display = 'block';

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

