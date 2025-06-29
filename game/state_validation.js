function broadcastEndState(endState) {
    console.log(`broadcastEndState called with: ${endState}`);
    if (endState === 'attacker-win') {
        storageData.end_state = {
            state: 'attacker-win',
            message: 'Attacker Wins'
        }
    }
    if (endState === 'defender-win') {
        storageData.end_state = {
            state: 'defender-win',
            message: 'Defender Wins'
        }
    }
}

var hasCapturedThisTurn = false

function validateMove(playerUUID, turn, move, stateData, tileData, rules) {
    playerUUID = playerUUID
    turn = turn
    move = move
    newStateData = stateData
    tileData = tileData
    boardSize = newStateData.length //determine board size without having to add another rule
    hasCapturedThisTurn = false

    if (rules) {
        // Object.entries(rules).forEach(([key, value]) => { //update rulebook
        //     ruleBook[key] = value
        // })
        ruleBook = rules
    }

    directions = [
        { dx: 0, dy: -1 }, // Up
        { dx: 0, dy: 1 },  // Down
        { dx: -1, dy: 0 }, // Left
        { dx: 1, dy: 0 }   // Right
    ]

    if (tileData[move.y][move.x] === 'goal' ||
        (ruleBook.includes("win_on_edge") &&
            (
                move.y == 0 ||
                move.y == boardSize - 1 ||
                move.x == 0 ||
                move.x == boardSize - 1
            )
        )
    ) {
        broadcastEndState('defender-win')
    }

    affectedOpponents = []
    directions.forEach(direction => {
        // find all opponent pieces adjacent to last moved piece
        nx = move.x + direction.dx
        ny = move.y + direction.dy

        if (
            ny >= 0 && ny < boardSize && // Check if ny is within bounds
            nx >= 0 && nx < boardSize && // Check if nx is within bounds
            newStateData[ny][nx] !== null && // Ensure the cell is not null
            !newStateData[ny][nx].type.includes(turn) && // Check if it's an opponent piece
            !(newStateData[move.y][move.x] == "defender-king" && ruleBook.includes("weaponless_king")) //make sure we didn't move a weaponless king
        ) {
            // client moved next to an opponent; check other side of opponent
            opponentData = newStateData[ny][nx]

            nnx = move.x + (direction.dx * 2)
            nny = move.y + (direction.dy * 2)
            if (
                nnx >= 0 && nnx < boardSize && // Check if nnx is within bounds
                nny >= 0 && nny < boardSize // Check if nny is within bounds
            ) {
                //* opponent is not against a wall
                if (tileData[nny][nnx] == "throne" && ruleBook.includes("hostile_throne")) {
                    capturePiece(nx, ny)
                }
                if (newStateData[nny][nnx] !== null && newStateData[nny][nnx].type.includes(turn) && newStateData[nny][nnx].type !== 'defender-king') {
                    if (opponentData.type === 'defender-king' && ruleBook.includes("advanced_king_capture")) { // handle advanced king capture
                        let nFriendlyAroundKing = 2 // we know we already have the king sandwiched
                        // Determine perpendicular directions
                        perpendicularDirections = direction.dx === 0
                            ? [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }] // Horizontal if current is vertical
                            : [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }]; // Vertical if current is horizontal

                        // Check the two remaining sides of opponent king
                        perpendicularDirections.forEach(perpendicular => {
                            pnnx = nx + perpendicular.dx; // nx is the opponent's x-coordinate
                            pnny = ny + perpendicular.dy; // ny is the opponent's y-coordinate

                            if (
                                pnnx >= 0 && pnnx < boardSize && // Check if sideX is within bounds
                                pnny >= 0 && pnny < boardSize && // Check if sideY is within bounds
                                newStateData[pnny][pnnx] !== null && // Ensure the cell is not null
                                newStateData[pnny][pnnx].type.includes(turn) // Check if it's a friendly piece
                            ) {
                                nFriendlyAroundKing++
                            }
                        })

                        if (nFriendlyAroundKing === 4) {
                            // we have the king surrounded. Capture and win Attackers
                            capturePiece(nx, ny)
                            broadcastEndState('attacker-win')
                        }
                    }
                    else {
                        if (newStateData[ny][nx].type === 'defender-king') {
                            broadcastEndState('attacker-win')
                        }
                        capturePiece(nx, ny)
                    }
                }

            } else {
                // opponent is up against a wall
                if (ruleBook.includes("capture_against_walls") /*&& opponentData.type !== 'defender-king'*/) {
                    capturePiece(nx, ny)
                }
            }
        }
    });
    if (hasCapturedThisTurn == false) {
        new Audio('../assets/sounds/move_0.wav').play()
    }
    return newStateData
}

function capturePiece(x, y) {
    newStateData[y][x] = null // capture piece
    cachedAudio.capture.play()
    hasCapturedThisTurn = true
}