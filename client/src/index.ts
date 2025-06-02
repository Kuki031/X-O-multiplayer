"use strict";

import {assignIds} from './assignIds.js';
assignIds();

// @ts-ignore
const socket = io();

let shouldStopGame = false;
let shouldStartGame: boolean;
let player: string;
let yourTurn: boolean;

const main = function() {

    socket.on("waiting connection", (connReady: boolean) => {
        shouldStartGame = connReady;
        if (!shouldStartGame) {
            document.querySelector(".waiting")?.classList.remove("hidden");
        } else {
            document.querySelector(".waiting")?.classList.add("hidden");
        }
    })

    socket.on("turn", (turn: string) => {

        const turnText = document.querySelector(".turn") as HTMLHeadingElement;

        if (turn !== player) {
            turnText.textContent = `${player === "X" ? "O" : "X"}'s turn!`;
            yourTurn = false;
        } else {
            turnText.textContent = "Your turn!";
            yourTurn = true;
        }
    });


    const roleDisplay = document.querySelector('.role') as HTMLElement;
    socket.on("receive role", (role: string) => {
        player = role;
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

        socket.on("game over", (gameOver: boolean) => {
            if (gameOver) {
                shouldStopGame = true;
            }
        });

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