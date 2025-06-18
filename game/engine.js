/* ----------------------------- Register Player ---------------------------- */
const storageId = window.location.hash.substring(1)
const playerId = crypto.randomUUID()
var storageData

registerPlayer()
async function registerPlayer() {
    new JSONBlobRequest().get('https://jsonblob.com/api/jsonBlob/' + storageId, function (err, response) {
        storageData = JSON.parse(response.text)

        if (storageData.registered_players.attacker == undefined) {
            storageData.registered_players.attacker = playerId
            attemptedToRegister = 'attacker'
        } else if (storageData.registered_players.defender == undefined) {
            storageData.registered_players.defender = playerId
            attemptedToRegister = 'defender'
        } else {
            storageData.registered_players.spectators.push(playerId)
        }

        new JSONBlobRequest().put('https://jsonblob.com/api/jsonBlob/' + storageId, storageData, function (err, response) {
            storageData = JSON.parse(response.text)
            if (storageData.registered_players[attemptedToRegister] == undefined) {
                console.error('Failed to register player. Retrying.')
                registerPlayer()
            } else {
                console.log('%cRegistered player ' + playerId, 'color:#72BE8C;')
                initializeGame()
            }
        })
    })
}

async function initializeGame() {
    /* ---------------------------- Declare Variables --------------------------- */
    const gameSettings = boards[storageData.board]

    const canvas = document.getElementById('board')
    const context = canvas.getContext('2d')

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    canvas.style.borderColor = '#4c4334'
    context.scale(devicePixelRatio, devicePixelRatio);
    const cellSize = canvas.offsetWidth / gameSettings.board_size
    var requestStatus = 'ready'

    const assetDirectories = {
        pieces: '../assets/pieces/',
        tiles: '../assets/tiles/'
    }
    var theme = {
        pieces: 'default',
        tiles: 'default'
    }
    pieceSize = 0.8
    var cachedImages = new Object()
    // cachedAudio is defined in index.html

    var tileData, boardX, boardY
    var activeCell = {
        x: null,
        y: null,
        stateData: null,
    }
    var validMoves = []

    prepareBoardData() //get default stateData

    if (storageData.state_data && Object.keys(storageData.state_data).length === 0) { // set up the pieces if they aren't already
        requestStatus = "pending"
        await new JSONBlobRequest().get('https://jsonblob.com/api/jsonBlob/' + storageId, function (err, response) {
            storageData = JSON.parse(response.text)
            storageData.state_data = stateData
            new JSONBlobRequest().put('https://jsonblob.com/api/jsonBlob/' + storageId, storageData, function (err, response) {
                requestStatus = "ready"
            })
        })
    }

    cacheImages().then(() => {
        downloadToClient()
        startSyncLoop()
        console.log('%cGame Ready!', 'color:#72BE8C;')

    })

    function drawBoard() {
        pieceOffset = (1 - pieceSize) / 2
        for (let y = 0; y < gameSettings.board_size; y++) {
            for (let x = 0; x < gameSettings.board_size; x++) {
                context.drawImage(cachedImages[tileData[y][x]], x * cellSize, y * cellSize, cellSize, cellSize)
                if (stateData[y][x]) {
                    context.drawImage(cachedImages[stateData[y][x].type], (x + pieceOffset) * cellSize, (y + pieceOffset) * cellSize, cellSize * pieceSize + pieceOffset, cellSize * pieceSize + pieceOffset)
                }
            }
        }
        renderActiveCell()
    }

    function renderActiveCell() {
        if (activeCell.stateData) {
            context.fillStyle = 'rgba(255, 255, 255, 0.56)'; // highlight active cell
            context.fillRect(activeCell.x * cellSize, activeCell.y * cellSize, cellSize, cellSize);
            context.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black for the dots
            validMoves.forEach(move => {
                const centerX = (move.x + 0.5) * cellSize;
                const centerY = (move.y + 0.5) * cellSize;
                const radius = cellSize * 0.1; // Dot size (10% of the cell size)

                context.beginPath();
                context.arc(centerX, centerY, radius, 0, Math.PI * 2);
                context.fill();
            });
        }
    }

    canvas.addEventListener('mousemove', (event) => {
        let rect = canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        boardX = Math.floor(mouseX / cellSize);
        boardY = Math.floor(mouseY / cellSize);

        if (
            boardX >= 0 && boardX < gameSettings.board_size &&
            boardY >= 0 && boardY < gameSettings.board_size
        ) {
            drawBoard(); // Redraw the board to clear previous highlights
            highlightCell(boardX, boardY); // Highlight the current cell
        } else {
            drawBoard(); // Redraw the board to clear previous highlights
        }
    });
    canvas.addEventListener('mouseleave', (event) => {
        drawBoard()
    })
    canvas.addEventListener('click', (event) => {
        if (storageData.registered_players[currentTurn] === playerId) {
            if (stateData[boardY][boardX] === null) {
                if (activeCell.stateData) {
                    // try to move piece
                    const isValidMove = validMoves.some(move => move.x === boardX && move.y === boardY);
                    if (isValidMove) {
                        // Render the move
                        stateData[boardY][boardX] = activeCell.stateData; // Place the piece in the new position
                        stateData[activeCell.y][activeCell.x] = null; // Clear the old position
                        // Deselect the piece and clear valid moves
                        activeCell.x = null;
                        activeCell.y = null;
                        activeCell.stateData = null;
                        validMoves = [];
                        //send move to server to validate
                        requestMove(crypto.randomUUID(), currentTurn, { x: boardX, y: boardY }, stateData, tileData, storageData.rules)
                    }
                }
            } else {
                if (activeCell.stateData === null && stateData[boardY][boardX].type.includes(currentTurn)) {
                    //select cell
                    activeCell.x = boardX
                    activeCell.y = boardY
                    activeCell.stateData = stateData[boardY][boardX]
                    console.log(activeCell)

                    // Calculate valid moves
                    validMoves = calculateValidMoves(boardX, boardY);
                } else {
                    // deselect cell
                    activeCell.x = null,
                        activeCell.y = null,
                        activeCell.stateData = null
                    validMoves = []
                }
            }
            drawBoard(); // Redraw the board to show valid moves
        }
    });

    async function requestMove(playerUUID, turn, move, stateData, tileData, rules) {
        stateData = validateMove(playerUUID, turn, move, stateData, tileData, rules) // render move clientside
        //TODO: validate the move serverside and sync with storage
        currentTurn = currentTurn === 'attacker' ? 'defender' : 'attacker' //toggle turn
        storageData.state_data = stateData
        storageData.turn = currentTurn
        uploadToCloud(storageData)
    }
    function uploadToCloud(object) {
        requestStatus = 'pending'
        new JSONBlobRequest().put('https://jsonblob.com/api/jsonBlob/' + storageId, object, function (err, response) {
            storageData = JSON.parse(response.text)
            if (storageData.end_state) {
                requestStatus = 'idle'

                alert(storageData.end_state.message)
            } else {
                requestStatus = 'ready'
            }
        })
    }

    function downloadToClient() {
        if (requestStatus === 'ready') {
            new JSONBlobRequest().get('https://jsonblob.com/api/jsonBlob/' + storageId, function (err, response) {
                storageData = JSON.parse(response.text)
                if (storageData.end_state) {
                    requestStatus = 'idle'
                    alert(storageData.end_state.message)
                    window.location = '../index.html'
                }
                if (JSON.stringify(stateData) !== JSON.stringify(storageData.state_data)) { //check if a move has happened
                    stateData = storageData.state_data // only bother to update large variables if they need to be
                    cachedAudio.move_0.play() //play sound when something happens
                }
                currentTurn = storageData.turn
                drawBoard()
            })
        }
    }

    function calculateValidMoves(x, y) {
        const moves = [];
        const directions = [
            { dx: 0, dy: -1 }, // Up
            { dx: 0, dy: 1 },  // Down
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 }   // Right
        ];

        directions.forEach(direction => {
            let nx = x + direction.dx;
            let ny = y + direction.dy;

            while (
                nx >= 0 && nx < gameSettings.board_size &&
                ny >= 0 && ny < gameSettings.board_size &&
                stateData[ny][nx] === null // Stop at the first blocked square
            ) {
                if (tileData[ny][nx] !== 'goal' && tileData[ny][nx] !== 'throne' || stateData[y][x].type === 'defender-king') {
                    moves.push({ x: nx, y: ny });
                }
                nx += direction.dx;
                ny += direction.dy;
            }
        });

        return moves;
    }



    //* -------------------------- Background Processes --------------------------

    async function startSyncLoop() {
        setInterval(function () {
            downloadToClient()
        }, 3000)
    }

    function highlightCell(x, y) {
        context.fillStyle = 'rgba(255, 255, 255, 0.35)';
        context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }

    function prepareBoardData() {
        // convert human-readable layout to useable array
        tileData = gameSettings.tile_layout.map(row =>
            row.map(item => gameSettings.tile_map[item])
        )
        stateData = gameSettings.pieces_layout.map(row =>
            row.map(item => gameSettings.piece_map[item] === null ? null : { type: gameSettings.piece_map[item] })
        )
    }

    async function cacheImages() {
        return new Promise((resolve, reject) => {
            let loadedCount = 0
            const tileFiles = ['tile.svg', 'throne.svg', 'goal.svg']
            const pieceFiles = ['attacker-pawn.svg', 'defender-king.svg', 'defender-pawn.svg']

            function loadImage(src, identifier) {
                const image = new Image()
                image.src = src
                image.onload = () => {
                    cachedImages[identifier] = image
                    loadedCount++
                    if (loadedCount === tileFiles.length + pieceFiles.length) {
                        resolve()
                    }
                }
            }

            tileFiles.forEach(file => {
                const src = `${assetDirectories.tiles}${theme.tiles}/${file}`
                const identifier = file.split('.')[0]
                loadImage(src, identifier)
            })

            pieceFiles.forEach(file => {
                const src = `${assetDirectories.pieces}${theme.pieces}/${file}`
                const identifier = file.split('.')[0]
                loadImage(src, identifier)
            })
        })
    }
}