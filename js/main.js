/*
options: 2x2, 4x4, 6x6
*/


const main_content = document.getElementById("main-content");
const scoreValue = document.getElementById("scoreValue");

let col = 4;
let row = 2;

const all_blocks = [1,2,3,4];       // all possible blocks
let remainingBlocks = [];           // blocks to be placed
let blockMap = [];                  // placement
let selectedBlocks = [];            // two blocks chosen

let score = 0;


scoreValue.innerText = score;
generateBlockMap();
displayBlocks();

const blocks = document.querySelectorAll(".block");
const blocksArr = Array.from(blocks); // or  arr = [...nodeList]
//console.log(blocks)

//let i = 0

blocks.forEach((block)=>{
    block.addEventListener('click', ()=>{
        block.children[0].style.display = 'block';
        console.log(blocksArr.indexOf(block));
        selectedBlocks.push(blocksArr.indexOf(block));

        if(selectedBlocks.length>=2){
            // run function to check whether values match in blockMap
            // and/or do the following
            checkIfBlocksMatch();
            
        }

    });
});

function checkIfBlocksMatch(){
    if(blockMap[selectedBlocks[0]]===blockMap[selectedBlocks[1]]){
        // correct blocks selected
        // update score
        
        document.querySelector(`#main-content :nth-child(${selectedBlocks[0]+1})`).classList += " found";
        document.querySelector(`#main-content :nth-child(${selectedBlocks[1]+1})`).classList += " found";
        
        score++;
        scoreValue.innerText = score;
        console.log(`Score: ${score}`);
        
        if(score>=all_blocks.length){
            console.log('Well Done!')
        }
    }else{
        // incorrect blocks selected
        setTimeout(() => {
            blocks.forEach((block)=>{
                if(!block.classList.contains("found")){
                    block.querySelector(" :nth-child(1)").style.display = 'none';
                }
            });
        }, 800);
    }

    selectedBlocks = []; // reset selection
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
            remainingBlocks.splice(randomBlock,1); // remove element
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
        main_content.innerHTML += `
            <div class="block">
                <img class="face-img" src="images/face-${block}.png" alt="">
            </div>
        `;
    });
    // blockMap.forEach((blockRow)=>{
    //     blockRow.forEach((e)=>{
    //         main_content.innerHTML += `
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

