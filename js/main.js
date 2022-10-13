/*
options: 2x2, 4x4, 6x6
*/


//const mainContent = document.getElementById("mainContent");
//const scoreCount = document.getElementById("scoreCount");
//const tryCount = document.getElementById("tryCount");

let col = 4;
let row = 2;

const all_blocks = [1,2,3,4];            // all possible blocks
let remainingBlocks = [];                // blocks to be placed
let blockMap = [];                       // placement
let selectedBlocks = [];                 // two blocks chosen

let scoreValue = 0;
let tryValue = 0;


scoreCount.innerText = scoreValue;
tryCount.innerText = tryValue;

generateBlockMap();
displayBlocks();

const blocks = document.querySelectorAll(".block");
const blocksArr = Array.from(blocks);                   // or  arr = [...nodeList]
//console.log(blocks)

let blockClicked = (event) => {
    const block = event.target;
    block.removeEventListener('click', blockClicked);   // same block cannot be selected more than once
    block.children[0].style.display = 'block';
    console.log(blocksArr.indexOf(block));
    selectedBlocks.push(blocksArr.indexOf(block));
    
    event.target.style.backgroundColor = "red";         // shows blocks that have been selected

    if(selectedBlocks.length>=2){
        removeBlockEventListeners();                    // prevents more than 2 blocks from being clicked
        checkIfBlocksMatch();
        setTimeout(addBlockEventListeners, 400);
    }

}

addBlockEventListeners();

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
        
        scoreValue++;
        scoreCount.innerText = scoreValue;
        console.log(`Score: ${scoreValue}`);
        
        if(scoreValue>=all_blocks.length){              // end of game
            console.log('Well Done!');
            scoreCount.style.color = "red";
            tryCount.style.color = "red";
        }
    }else{
        // blocks don't match
        setTimeout(() => {
            block1.querySelector(" :nth-child(1)").style.display = 'none';
            block2.querySelector(" :nth-child(1)").style.display = 'none';
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

    all_blocks.forEach((e)=>{
        for (let r = 0; r < row; r++) {
            remainingBlocks.push(e);
        }
    });
    
        for (let c = 0; c < row*col; c++) {
            let randomBlock = Math.floor(Math.random()*remainingBlocks.length)+0; // 0 to 7 index
            blockMap[c] = remainingBlocks[randomBlock];
            remainingBlocks.splice(randomBlock,1);          // remove element
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
    blockMap.forEach((block)=>{
        mainContent.innerHTML += `
            <div class="block">
                <img class="face-img" src="images/face-${block}.png" alt="">
            </div>
        `;
    });
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

