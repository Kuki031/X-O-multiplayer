"use strict";

import {assignIds} from './assignIds.js';
assignIds();

// @ts-ignore
const socket = io();

let shouldStopGame = false;
let player: string;

const main = function() {

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