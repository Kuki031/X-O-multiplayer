type GameConstants = {
  isGameOver: boolean;
  winConditions: number[][];
  roles: string[];
};

const constants = function(): GameConstants {
    const GAME_OVER = false;
    const ROLES = ["X", "O"];
    const WIN_CONDITIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

    return {
        isGameOver: GAME_OVER, 
        winConditions: WIN_CONDITIONS, 
        roles: ROLES
    }
}

export { constants };