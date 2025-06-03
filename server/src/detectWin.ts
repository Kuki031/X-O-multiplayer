export const detectWin = function(winConditions: number[][]): Array<boolean|string|number|null> {

    let winningRow: number = 0;
    let isOver: boolean = false;
    let winner: string|number|null = null;

    for(let i = 0 ; i < winConditions.length ; i++) {
        
        const a = winConditions[i][0];
        const b = winConditions[i][1];
        const c = winConditions[i][2];

        for(let j = 0 ; j < winConditions[i].length ; j++) {
            if (a === b && b === c && a === c) {
                winningRow = i;
                winner = winConditions[i][j];
                isOver = true;
                break;
            }
        }
        if (isOver) {
            break;
        }
    }

    return [isOver, winner, winningRow];
}