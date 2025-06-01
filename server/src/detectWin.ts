export const detectWin = function(winConditions: number[][]): boolean {
    let isOver: boolean = false;

    for(let i = 0 ; i < winConditions.length ; i++) {
        
        const a = winConditions[i][0];
        const b = winConditions[i][1];
        const c = winConditions[i][2];

        for(let j = 0 ; j < winConditions[i].length ; j++) {
            if (a === b && b === c && a === c) {
                console.log(`${winConditions[i][j]} won.`);
                isOver = true;
                break;
            }
        }
        if (isOver) {
            break;
        }
    }
    return isOver;
}