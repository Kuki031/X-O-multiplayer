"use strict";

import {assignIds} from './assignIds.js';
assignIds();

// @ts-ignore
const socket = io();

let shouldStopGame = false;
let shouldStartGame: boolean;
let player: string|null;
let yourTurn: boolean;
let uniqueSession: number;
const turnText = document.querySelector(".turn") as HTMLHeadingElement;

const main = function() {

    socket.on("unique session", (session: number) => {
        uniqueSession = session;
    });


    socket.on("waiting connection", (connReady: boolean) => {
        shouldStartGame = connReady;
        if (!shouldStartGame) {
            document.querySelector(".waiting")?.classList.remove("hidden");
        } else {
            document.querySelector(".waiting")?.classList.add("hidden");
        }
    })

    socket.on("turn", (turn: string) => {

        if (player === "observer") {
            turnText.textContent = `${turn}'s turn!`;
        }

        else if (turn !== player) {

            turnText.textContent = `${player === "X" ? "O" : "X"}'s turn!`;
            yourTurn = false;
        } else {
            turnText.textContent = "Your turn!";
            yourTurn = true;
        }
    });

    socket.on("game over", (gameResult: Array<boolean|string|number|null>) => {
        if (gameResult) {

            const [isOver, winner, winningRow] = gameResult;
            triggerUIUpdate(winningRow);
            
            if (isOver) {
                shouldStopGame = true;
            }

            const winnerHeading = document.querySelector(".winner") as HTMLHeadingElement;
            turnText.textContent = "Game over!";
            
            if (winner === player) {
                winnerHeading.textContent = `You won!`;
            } else {
                winnerHeading.textContent = `Winner is ${winner}!`;
            }

            if (player !== "observer")
            {
                socket.on("play again?", () => {
                    const playAgainDiv: Element|null = document.querySelector(".play-again-wrap");
                    playAgainDiv?.classList.remove("hidden");

                    const buttonDiv: Element|null = document.querySelector(".play-again div");
                    buttonDiv?.addEventListener("click", function(e) {
                        let mainEl = e.target as HTMLElement;
                        if (!mainEl.classList.contains("play-again-btn")) {
                            return;
                        }

                        if (mainEl.textContent === "Yes") { 
                            socket.emit("confirm playing again", 1);
                            
                            if(player) {
                                localStorage.setItem(`role-${uniqueSession}`, player);
                            }

                            mainEl.style.backgroundColor = "rgb(63, 231, 63)";
                            mainEl.style.color = "rgb(243, 242, 242)";
                            mainEl.setAttribute("disabled", "true");
                        } else {
                            return;
                        }
                    });
                });
            }
        }
    });

    socket.on("force reload", (forceReload: boolean) => {
        if (forceReload) {
            if (player !== "observer") {
                window.location.reload();
            }
        }
    });


    const roleDisplay = document.querySelector('.role') as HTMLElement;
    socket.on("receive role", (role: string) => {
        player = localStorage.getItem(`role-${uniqueSession}`) ? localStorage.getItem(`role-${uniqueSession}`) : role;
        if (roleDisplay) {
            roleDisplay.textContent = player;
        }
    })

    socket.on("position", (pos: Array<object>) => {
        pos.forEach((position: object) => {
            const gridCell: Element | null = document.getElementById(`${(position as any).mainElId}`);
            if (gridCell) {
                gridCell.textContent = (position as any).symbol
            }
        })
    })


    document.querySelector('.cell-wrap')?.addEventListener('click', function(e) {

        if (!yourTurn) {
            return;
        }

        if (!shouldStartGame) {
            return;
        }

        if (player === "observer")
        {
            return;
        }


        const mainEl = e.target as HTMLElement;
        if (!mainEl.classList.contains('cell')) {
            return;
        }

        if (mainEl.textContent) {
            return;
        }

        if (shouldStopGame) {
            return;
        }


        mainEl.textContent = player;
        const mainElId = parseInt(mainEl.id);
        socket.emit("position", mainElId);
        socket.emit("symbol", player);
        mainEl.setAttribute("disabled", "true");
    });
}
main();

const triggerUIUpdate = function(rowIndex: string|number|boolean|null): void {

    const cellWinConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

    for(let i = 0 ; i < cellWinConditions.length ; i++)
    {
        if (i === rowIndex)
        {
            cellWinConditions[i].forEach((cell, _index) => {
                
                const element = document.getElementById(`${cell}`) as HTMLDivElement;
                element.style.backgroundColor = "rgb(107, 238, 107)";
                element.style.color = "rgb(233, 51, 87)";
            })
            break;
        }
    }
}