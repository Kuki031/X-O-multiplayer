"use strict"

import express from 'express';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { Server, Socket } from 'socket.io';
import { constants } from './constants';
import { detectWin } from "./detectWin";


const app = express();
const server = createServer(app);
const io = new Server(server);
const observers: Array<Socket> = [];

let winConditions = constants().winConditions;
let roles = constants().roles;
let turnRoles: Array<string> = [...roles];
let isGameOver = constants().isGameOver;
let connectedPlayers = 0;
let turn = turnRoles[Math.floor(Math.random() * turnRoles.length)];
let playAgainCount = 0;
let uniqueSession = Date.now();


app.use(express.static(join(__dirname, '../../client/src')));
app.use('/dist', express.static(join(__dirname, '../../client/dist')));
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../../client/src/index.html'));
});


let positionsArray: Array<object> = [];
io.on('connection', async (socket) => {

    connectedPlayers++;

    if ((await io.fetchSockets()).length > 2) {
      observers.push(socket);
    }

    socket.on("confirm playing again", (count: number) => {
      playAgainCount += count;
      
      if (playAgainCount === 2) {
        winConditions = constants().winConditions;
        roles = constants().roles;
        turnRoles = [...roles];
        isGameOver = constants().isGameOver;
        connectedPlayers = 0;
        turn = turnRoles[Math.floor(Math.random() * turnRoles.length)];
        playAgainCount = 0;

        io.emit("force reload", true);
      }
    });

  if (roles.length) {
    socket.emit("receive role", roles[0]);
    roles.shift();
    
  } else {
    socket.emit("receive role", "observer");
  }

  if (connectedPlayers < 2) {
    io.emit("waiting connection", false);
  } else {
    
    io.emit("waiting connection", true);
    io.emit("turn", turn);
    io.emit("unique session", uniqueSession);
  }

  socket.on('position', (pos) => {
    
    const mainElId: number = parseInt(pos);
    socket.on("symbol", (symbol) => {

      if (symbol === "X") {
        turn = "O"
      } else if (symbol === "O") {
        turn = "X"
      }

      io.emit("turn", turn);

      for(let i = 0 ; i < winConditions.length ; i++) {
        const matchElInArray = winConditions[i].includes(mainElId, 0);
                
        if (matchElInArray) {
            const switchEl = winConditions[i].map((x) => x === mainElId ? symbol : x);
            winConditions[i] = switchEl;

        } else {
            continue;
        }
      }

      positionsArray.push( {mainElId, symbol} );
      const [isOver, winner, winningRow] = detectWin(winConditions);
      if (isOver)
      {
        isGameOver = true;
        io.emit("game over", [isGameOver, winner, winningRow]);
      }

      io.emit("position", positionsArray)

      if (isGameOver) 
      {
        io.emit("play again?", playAgainCount);
      }
    });
  });

  socket.on('disconnect', () => {
        winConditions = constants().winConditions;
        roles = constants().roles;
        turnRoles = [...roles];
        isGameOver = constants().isGameOver;
        connectedPlayers = 0;
        turn = turnRoles[Math.floor(Math.random() * turnRoles.length)];
        playAgainCount = 0;
        positionsArray = [];
        io.emit("force reload", true);
  });
});



server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
