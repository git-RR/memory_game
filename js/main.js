/*
options: 2x2, 4x4, 6x6
*/


const main_content = document.getElementById("main-content");

let col = 4;
let row = 2;

const all_blocks = [1,2,3,4];       // all possible blocks
let remainingBlocks = [];
let blockMap = [];                  // placement
let selectedBlocks = [];            // two blocks chosen

generateBlockMap();
displayBlocks();

const blocks = document.querySelectorAll(".block");
const blocksArr = Array.from(blocks); // or  arr = [...nodeList]
console.log(blocks)

let i = 0

blocks.forEach((block)=>{
    block.addEventListener('click', ()=>{
        block.children[0].style.display = 'block';
        console.log(blocksArr.indexOf(block));
        selectedBlocks.push(blocksArr.indexOf(block));

        if(selectedBlocks.length>=2){
            // run function to check whether values match in blockMap
            // and/or do the following
            setTimeout(() => {
                blocks.forEach((block)=>{
                    block.children[0].style.display = 'none';
                });
            }, 800);
            selectedBlocks = []; // reset selection
        }

    });
});


function generateBlockMap(){
    // generate random placement of blocks and place in blockMap

    all_blocks.forEach((e)=>{
        remainingBlocks.push(e);
        remainingBlocks.push(e);
    });                                 // blocks to be placed
    
    for (let r = 0; r < row; r++) {
        blockMap.push([]);
        for (let c = 0; c < col; c++) {
            let randomBlock = Math.floor(Math.random()*remainingBlocks.length)+0; // 0 to 7 index
            blockMap[r][c] = remainingBlocks[randomBlock];
            remainingBlocks.splice(randomBlock,1); // remove element
        }
    }
    
    console.log(blockMap);
}

function displayBlocks(){
    blockMap.forEach((blockRow)=>{
        blockRow.forEach((e)=>{
            main_content.innerHTML += `
                <div class="block">
                    <img class="face-img" src="images/face-${e}.png" alt="">
                </div>
            `;
        })
    });
}

