const assetDirectories = {
    pieces: '../assets/pieces/',
    tiles: '../assets/tiles/'
}
var theme = {
    pieces: 'default',
    tiles: 'default'
}
var cachedImages = new Object()

document.body.onload = async function () {
    cacheImages().then(() => {
        loadPreviews()
        ulist = document.getElementById('variant-specific-rules')
        Object.entries(rulesDescriptions).forEach(([key, rule]) => {
            checkbox = document.createElement('INPUT')
            checkbox.type = 'checkbox'
            checkbox.id = key
            checkbox.name = key
            checkbox.value = key
            checkbox.classList.add('rule-checkbox')

            checkmark = document.createElement('SPAN')
            checkmark.classList.add('checkmark')

            label = document.createElement('LABEL')
            label.htmlFor = key
            label.innerHTML = rule
            label.classList.add('custom-checkbox-label')
            label.appendChild(checkmark)


            listItem = document.createElement('LI')
            listItem.classList.add('rule-wrapper')

            listItem.appendChild(checkbox)
            listItem.appendChild(label)
            ulist.appendChild(listItem)
        })

        console.log('%cLoaded website... welcome to Tafl Online!', 'color:#72BE8C;')
    })
}

document.querySelectorAll('.game-selector').forEach(element => {
    element.addEventListener('click', event => {
        previousSelected = document.querySelector('.selected')
        if (previousSelected) { previousSelected.classList.remove('selected') }
        element.classList.add('selected')
        rulesElement = document.getElementById('rules-container')
        defaultRules = boards[element.dataset.gamelookup].rules

        if (defaultRules.includes("win_on_edge")) {
            document.getElementById('optional-edge-win').style.display = 'list-item'
            document.getElementById('optional-corner-win').style.display = 'none'
        } else {
            document.getElementById('optional-edge-win').style.display = 'none'
            document.getElementById('optional-corner-win').style.display = 'list-item'
        }
        document.querySelectorAll('.rule-checkbox').forEach(element => {
            if (defaultRules.includes(element.id)) {
                element.checked = true
            } else {
                element.checked = false
            }
        })

        rulesElement.style.display = 'block'
    })
})

async function loadPreviews() {
    document.querySelectorAll('.preview-canvas').forEach((element) => {
        gameSettings = boards[element.dataset.board]
        const canvas = element
        const context = canvas.getContext('2d')

        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * devicePixelRatio;
        canvas.height = canvas.offsetHeight * devicePixelRatio;
        canvas.style.borderColor = '#4c4334'
        context.scale(devicePixelRatio, devicePixelRatio);
        const cellSize = canvas.offsetWidth / gameSettings.board_size
        pieceSize = 0.8

        // convert human-readable layout to useable array
        tileData = gameSettings.tile_layout.map(row =>
            row.map(item => gameSettings.tile_map[item])
        )
        stateData = gameSettings.pieces_layout.map(row =>
            row.map(item => gameSettings.piece_map[item] === null ? null : { type: gameSettings.piece_map[item] })
        )
        pieceOffset = (1 - pieceSize) / 2

        for (let y = 0; y < gameSettings.board_size; y++) {
            for (let x = 0; x < gameSettings.board_size; x++) {
                context.drawImage(cachedImages[tileData[y][x]], x * cellSize, y * cellSize, cellSize, cellSize)
                if (stateData[y][x]) {
                    context.drawImage(cachedImages[stateData[y][x].type], (x + pieceOffset) * cellSize, (y + pieceOffset) * cellSize, cellSize * pieceSize + pieceOffset, cellSize * pieceSize + pieceOffset)
                }
            }
        }
    })
}


async function startGame() {
    boardSelection = document.querySelector('.selected').dataset.gamelookup
    startingRules = []
    document.querySelectorAll('.rule-checkbox:checked').forEach(element => {
        startingRules.push(element.id)
    })

    registerNewGame(boardSelection, startingRules)
}

async function registerNewGame(board, rules) {
    const registerData = {
        "board": board,
        "registered_players": {
            "attacker": undefined,
            "defender": undefined,
            "spectators": []
        },
        "state_data": {},
        "turn": "attacker",
        "rules": rules
    };

    var storage = new JSONBlobRequest()
    storage.post(registerData, function (err, response) {
        gameId = response.location.split('http://jsonblob.com/api/jsonBlob/')[1]
        document.location = './game#' + gameId
    })
}

async function joinGame(gameId) {
    window.location = './game#' + gameId
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