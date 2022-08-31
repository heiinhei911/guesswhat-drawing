# Guess What - Multiplayer Word Guessing Game

A word-guessing multiplayer game that challenges players to guess a series of words based on the drawings from other players over multiple rounds
Each player takes turns guessing or drawing after one another. The player with the highest score at the end of the game wins

Check out my bullet board [https://heiinhei911.github.io/bulletin-board](https://heiinhei911.github.io/bulletin-board) to see tracked bugs of this project.

![Demo GIF](./assets/../../src/assets/demo.gif)

## How to Play

Firstly, start off by navigating to the website. Once the page has loaded, you can enter your name in the "Enter your name:" field. After that, you can either create or join a room.

### Creating/Join a Room

To create a room, simply click the "Create" button without entering a room ID (leave the "Enter a room ID" field blank), you will be taken to the "Waitroom" page.

Note: the ID of the newly created room will be automatically copied to your clipboard. You can then send the ID to other people, who can join a room via one of the two methods below:

If you already have a room ID that somebody else has created, you can either:

- copy the code and paste it into the "Enter a room ID" field and click "Join"
- Navigate directly to "https://guesswhat-drawing.netlify.app/{roomID}" to jump straight into a room. (You will be asked to enter a display name if you do not already have a name set)

### Waitroom

Either way, you will be taken to the "Waitroom" page. Here the creator of the room can configure how they want to game to be set up. They can set the number of rounds (how many rounds the game will run for) and the duration of each round (how long each round will last). The creator can start the game once all the settings have been configured.

### Gameplay

Once the game has started, a randomized list of words will be generated. Players will take turns guessing or drawing on the canvas in a randomized order.

When it is a player's turn to draw, a word will be display to this player only. This player will have to try their best to describe the hidden word by drawing as best as they can without directly giving away the word. Other players will try to guess the hidden word. A round could end in three ways:

- When one player guesses the hidden word of the round (one point to both the person drawing and the guesser)
- When no one in the room manages to guess the hidden word [when the timer runs out] (no points for anyone)
- When the player disconnects from the room when it is their turn (the turn will be skipped)

The game repeats for however many rounds \(with each round lasting for however long\) that the creator has set at the beginning in the waitroom.

Finally, whoever has the most points wins the game. After a review screen of the game, all the players will be taken back to the lobby.

## Features

In the lobby, uou can:

- Create a new room
- Join an existing room
- Set your own display name

Once you are in a room, you can:

- Chat with everyone in the room
- See the list of players in the room
- (Creator only) Set the number of rounds
- (Creator only) Set the duration of each round

Once the game has started, you can:

- See the current round, the total number of rounds, and the time remaining for a given round
- Chat with everyone in the room
- Draw on the canvas (once it is your turn)
- See the hidden word (once it is your turn)
- Make guesses of the drawing (when it is somebody else's turn)
- See the list of players in the room and their scores (work in progress)

On the canvas, you can:

- Change the color of your pen
- Adjust the thickness of your pen
- Adjust the style of your pen
- Switch between "pen" and "eraser" mode
- Clear the canvas

## Frameworks/Libraries Used

Frontend: React, React Router, SASS Modules
Backend: Socket.io, NodeJS, Express, MongoDB

## Credits

This project was bootstrapped with Create React App.

Created by Steve Sam
