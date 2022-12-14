export default function createGame() {

    const state = {
        players: {},
        fruits: {},
        screen: {
            height: 10,
            width: 10
        }
    }

    const livres = {};

    for(let i = 0; i < 10; i++) {
        for(let j = 0; j < 10; j++) {
            let id = i+'-'+j;

            livres[id] = id;
        }
    }

    const observers = [];

    function randomProperty(obj) {
        var keys = Object.keys(obj);
        return obj[keys[ keys.length * Math.random() << 0]];
    }

    function addRandomFruit() {
        let escolhidostring = randomProperty(livres);
        if(escolhidostring) {
            const position = escolhidostring.split('-');
            delete livres[escolhidostring];

            addFruit({ fruitX: position[0], fruitY: position[1], fruitId: escolhidostring});
        }
    }

    function start() {
        const frequency = 1000;
                
        setInterval(addRandomFruit, frequency);
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction);
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command);
        }
    }

    function setState(newState) {
        Object.assign(state, newState);
    }

    function addPlayer(command) {
        const playerId = command.playerId;
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width);
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height);

        state.players[playerId] = {
            x: playerX,
            y: playerY
        }

        notifyAll({
            type: 'add-player',
            playerId: playerId,
            playerX: playerX,
            playerY: playerY
        });
    }

    function removePlayer(command) {
        const playerId = command.playerId;

        delete state.players[playerId];

        notifyAll({
            type: 'remove-player',
            playerId: playerId
        });
    }

    function addFruit(command) {
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000);
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width);
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height);

        //addObject(fruitX, fruitY, fruitId);

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

        notifyAll({
            type: 'add-fruit',
            fruitId: fruitId,
            fruitX: fruitX,
            fruitY: fruitY
        });        
    }

    function removeFruit(command) {
        const fruitId = command.fruitId;

        deleteObject(state.fruits[fruitId].x, state.fruits[fruitId].y);
        
        delete state.fruits[fruitId];

        notifyAll({
            type: 'remove-fruit',
            fruitId: fruitId
        });
    }

    function movePlayer(command) {
        //console.log(`game.movePlayer() -> Moving ${command.playerId} with ${command.keyPressed}`);
        notifyAll(command);

        const acceptedMoves = {
            ArrowUp(player) {
                //console.log('game.movePlayer().ArrowUp() -> Moving player Up');
                if(player.y -1 >= 0) {
                    player.y = player.y -1;
                }
            },
            ArrowDown(player) {
                //console.log('game.movePlayer().ArrowDown() -> Moving player Down');
                if(player.y +1 < state.screen.height) {
                    player.y = player.y +1;
                }
            },
            ArrowRight(player) {
                //console.log('game.movePlayer().ArrowRight() -> Moving player Right');
                if(player.x +1 < state.screen.width) {
                    player.x = player.x +1;
                }
                
            },
            ArrowLeft(player) {
                //console.log('game.movePlayer().ArrowLeft() -> Moving player Left');
                if(player.x -1 >= 0) {
                    player.x = player.x -1;
                }
            }
        }

        const keyPressed = command.keyPressed;
        const playerId = command.playerId;
        const player = state.players[command.playerId];
        const moveFunction = acceptedMoves[keyPressed];
        
        if(player && moveFunction) {
            moveFunction(player);
            checkForFruitCollision(playerId);
        }
    }

    function checkForFruitCollision(playerId) {
        
        const player = state.players[playerId];

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId];
            console.log(`Checking ${playerId} and ${fruitId}`);

            if(player.x === fruit.x && player.y === fruit.y) {
                console.log(`COLLISION between ${playerId} and ${fruitId}`);
                removeFruit( {fruitId: fruitId} );
            }
        }
        
    }

    return {
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        movePlayer,
        state,
        setState,
        subscribe,
        start
    }
}