
const main_section = document.getElementById("main-content");

let col = 4;
let row = 2;

const all_blocks = [1,2,3,4];      // all possible blocks
let remainingBlocks = [];
all_blocks.forEach((e)=>{
    remainingBlocks.push(e);
    remainingBlocks.push(e);
});                              // blocks to be placed
let answerBlocks = [];      // placement

for (let r = 0; r < row; r++) {
    answerBlocks.push([]);
    for (let c = 0; c < col; c++) {
        let randomBlock = Math.floor(Math.random()*remainingBlocks.length)+0; // 0 to 7 index
        answerBlocks[r][c] = remainingBlocks[randomBlock];
        remainingBlocks.splice(randomBlock,1); // remove element
    }
}

console.log(answerBlocks);