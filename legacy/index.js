var myTeam = 'attacker' // is reset when game begins
var selected = null
var selectedIndex = null


function renderGameGrid(setupGameData) {
	container = document.querySelector('#game-board')
	if (window.innerHeight > window.innerWidth) {
		container.style.width = '80vw'
		container.style.height = '80vw'
	} else {
		container.style.width = '80vh'
		container.style.height = '80vh'
	}
	container.innerHTML = ''
	for (i = 0; i < rules.boardLayouts[rules.board][0].length; i++) {
		var row = document.createElement('DIV')
		row.style.height = `${100 / rules.boardLayouts[rules.board].length}%`
		row.style.width = `100%`
		row.classList.add('game-board-row')
		for (j = 0; j < rules.boardLayouts[rules.board][0].length; j++) {
			let cell = document.createElement('DIV')
			cell.style.height = `100%`
			cell.style.width = `${100 / rules.boardLayouts[rules.board][0].length}%`
			cell.classList.add('game-board-cell')
			cell.classList.add('cell-type-' + rules.boardLayouts[rules.board][i][j])
			cell.dataset.x = j // save cell X
			cell.dataset.y = i // save cell Y
			cell.id = `x${j}y${i}`
			cell.addEventListener('click', event => { // cell clicked
				selectPiece(cell.dataset.x, cell.dataset.y)
			})
			row.appendChild(cell)
			if (setupGameData === true) {
				if (rules.boardLayouts[rules.board][i][j] == 1) {
					gameData.pieces.push({
						team: 'defender',
						role: 'king',
						coords: [j, i],
					})
				} else if (rules.boardLayouts[rules.board][i][j] == 2) {
					gameData.pieces.push({
						team: 'defender',
						role: 'defender',
						coords: [j, i],
					})
				} else if (rules.boardLayouts[rules.board][i][j] == 3) {
					gameData.pieces.push({
						team: 'attacker',
						role: 'attacker',
						coords: [j, i],
					})
				}
			}
		}
		container.appendChild(row)
	}
}


/*
*	== Select a piece ==
	Search for the correct piece to move by looking up its cell X and Y coords
*/
function selectPiece(coordX, coordY) {
	if (selected == null) { // Nothing is selected yet:
		for (i = 0; i < gameData.pieces.length; i++) { // loop through pieces
			if (gameData.pieces[i]) { // does the piece exist? Required to prevent errors
				if (gameData.pieces[i].coords[0] == coordX && gameData.pieces[i].coords[1] == coordY && gameData.pieces[i].team == myTeam) { // Coordinates match and the piece is the correct team?
					selected = gameData.pieces[i] // clone piece data from gameData
					selectedIndex = i // also save the index for faster lookup
					break
				}
			}
		}

	} else { // Already selected a piece
		if (rules.turn == myTeam) {
			if (coordX == selected.coords[0] && coordY == selected.coords[1]) { // Clicked same piece again?
				selected = null // deselect the piece
				selectedIndex = null
			} else { // Piece selected and trying to move
				if (rules.defendersMayBoardShips == false && selected.team == 'defender' && rules.boardLayouts[rules.board][newY][newX] == 3) {
					selected = null // reset
					selectedIndex = null
				} else {
					movePiece(selected, selectedIndex, [coordX, coordY]) // Try to move the piece
					selected = null // reset
					selectedIndex = null
				}
			}
		}
	}
}

function renderPieces() {
	turnDisplay = document.querySelector('#turn')
	turnDisplay.innerHTML = `> ${String(rules.turn).toUpperCase()}'s turn`
	if (rules.turn == myTeam) {
		turnDisplay.style.color = 'var(--cta-color)'
	} else {
		turnDisplay.style.color = 'var(--text-color)'
	}

	elements = document.querySelectorAll('.game-board-cell')
	for (i = 0; i < elements.length; i++) {
		elements[i].innerHTML = ''
	}
	for (i = 0; i < gameData.pieces.length; i++) {
		if (gameData.pieces[i]) {
			piece = gameData.pieces[i]
			cell = document.querySelector(`#x${piece.coords[0]}y${piece.coords[1]}`)
			cell.innerHTML = `<img class="game-piece-icon" src="/legacy/assets/v1/${piece.role}.png">`
		}
	}
}


function movePiece(piece, lookupIndex, newCoords) {
	oldX = piece.coords[0]
	oldY = piece.coords[1]
	newX = newCoords[0]
	newY = newCoords[1]
	attemptX = oldX
	attemptY = oldY

	moving = false

	team = selected.team // get piece ID
	if (oldX == newX || oldY == newY) { //piece is moving straight
		if (oldX < newX) {
			moving = true
			for (attemptX = oldX; attemptX < newX; attemptX++) {
				for (i = 0; i < gameData.pieces.length; i++) {
					if (gameData.pieces[i] && gameData.pieces[i].coords[0] == attemptX + 1 && gameData.pieces[i].coords[1] == oldY) {
						moving = false
						break
					}
				}
				if (moving == false) break
			}
			gameData.pieces[lookupIndex].coords[0] = attemptX
		}
		else if (oldX > newX) {
			moving = true
			for (attemptX = oldX; attemptX > newX; attemptX--) {
				for (i = 0; i < gameData.pieces.length; i++) {
					if (gameData.pieces[i] && gameData.pieces[i].coords[0] == attemptX - 1 && gameData.pieces[i].coords[1] == oldY) {
						moving = false
						break
					}
				}
				if (moving == false) break
			}
			gameData.pieces[lookupIndex].coords[0] = attemptX
		}

		else if (oldY < newY) {
			moving = true
			for (attemptY = oldY; attemptY < newY; attemptY++) {
				for (i = 0; i < gameData.pieces.length; i++) {
					if (gameData.pieces[i] && gameData.pieces[i].coords[1] == attemptY + 1 && gameData.pieces[i].coords[0] == oldX) {
						moving = false
						break
					}
				}
				if (moving == false) break
			}
			gameData.pieces[lookupIndex].coords[1] = attemptY
		}
		else if (oldY > newY) {
			moving = true
			for (attemptY = oldY; attemptY > newY; attemptY--) {
				for (i = 0; i < gameData.pieces.length; i++) {
					if (gameData.pieces[i] && gameData.pieces[i].coords[1] == attemptY - 1 && gameData.pieces[i].coords[0] == oldX) {
						moving = false
						break
					}
				}
				if (moving == false) break
			}
			gameData.pieces[lookupIndex].coords[1] = attemptY
		}
	}
	if (rules.boardLayouts[rules.board][attemptY][attemptX] === 4) {
		if (selected.role == 'king') {
			broadcastWin('defender')
		} else {
			attemptX = oldX
			attemptY = oldY
			gameData.pieces[selectedIndex].coords = [oldX, oldY]
		}
	}

	if (!(attemptX == oldX && attemptY == oldY)) {
		gameData.lastPieceMoved = lookupIndex
		checkForCapture()
		renderPieces()
		rules.turn = rules.turn == 'defender' ? 'attacker' : 'defender'
		submitMove()
	}
}

function checkForCapture() {
	// check that piece exists
	for (i = 0; i < gameData.pieces.length; i++) {
		if (gameData.pieces[i]) {// check that piece exists
			piece = gameData.pieces[i]
			gameData.pieces[i].endangered = false //turn based safety check; checked with piece.safe to determine if the piece has purposely put itself between two enemies
			for (j = 0; j < gameData.pieces.length; j++) {
				if (gameData.pieces[j]) {
					test = gameData.pieces[j] // get a piece to check the first against
					if (piece.team !== test.team) {
						/* KING CODE: Only takes effect when surroundKingCapture is true */
						if (piece.role == 'king' && rules.surroundKingCapture == true) {
							if (test.coords[0] === piece.coords[0] + 1 && test.coords[1] == piece.coords[1]) { // attacker on right
								for (n = 0; n < gameData.pieces.length; n++) {
									if (gameData.pieces[n] && piece.team !== gameData.pieces[n].team && gameData.pieces[n].coords[0] == piece.coords[0] - 1 && gameData.pieces[n].coords[1] == piece.coords[1]) { //attacker on left

										for (k = 0; k < gameData.pieces.length; k++) {
											if (gameData.pieces[k] && piece.team !== gameData.pieces[k].team && gameData.pieces[k].coords[1] == piece.coords[1] + 1 && gameData.pieces[k].coords[0] == piece.coords[0]) { //attacker on bottom
												for (c = 0; c < gameData.pieces.length; c++) {
													if (gameData.pieces[c] && piece.team !== gameData.pieces[c].team && gameData.pieces[c].coords[1] == piece.coords[1] - 1 && gameData.pieces[c].coords[0] == piece.coords[0]) broadcastWin('attacker') //attacker on top
												}
											}
										}
									}
								}
							}
						} else {

							/* REGULAR CODE */
							if (rules.wallCapture == true) {
								if (piece.coords[0] == 0) { // left wall capture
									if (test.coords[0] == 1 && test.coords[1] == piece.coords[1]) capture(i)
								} else if (piece.coords[0] == rules.boardLayouts[rules.board][0].length - 1) { // right wall capture
									if (test.coords[0] == piece.coords[0] - 1 && test.coords[1] == piece.coords[1]) capture(i)
								} else if (piece.coords[1] == 0) { // top wall capture
									if (test.coords[1] == 1 && test.coords[0] == piece.coords[0]) capture(i)
								} else if (piece.coords[1] == rules.boardLayouts[rules.board].length - 1) { // bottom wall capture
									if (test.coords[1] == piece.coords[1] - 1 && test.coords[0] == piece.coords[0]) capture(i)
								}
							}
							//hammer-anvil capture
							if (test.coords[0] === piece.coords[0] + 1 && test.coords[1] == piece.coords[1]) {
								for (n = 0; n < gameData.pieces.length; n++) {
									if (gameData.pieces[n] && piece.team !== gameData.pieces[n].team && gameData.pieces[n].coords[0] == piece.coords[0] - 1 && gameData.pieces[n].coords[1] == piece.coords[1]) capture(i)
								}
							} else if (test.coords[1] === piece.coords[1] + 1 && test.coords[0] == piece.coords[0]) {
								for (n = 0; n < gameData.pieces.length; n++) {
									if (gameData.pieces[n] && piece.team !== gameData.pieces[n].team && gameData.pieces[n].coords[1] == piece.coords[1] - 1 && gameData.pieces[n].coords[0] == piece.coords[0]) capture(i)
								}
							}
						}
					}
				}
			}
			if (gameData.pieces[i] && gameData.pieces[i].endangered == false) gameData.pieces[i].safe = false //enemy pieces have moved away from safe pieces, remove safety mark
		}
	}

	function capture(index) {
		if (gameData.pieces[index]) {
			gameData.pieces[index].endangered = true
			if (index == gameData.lastPieceMoved || gameData.pieces[index].safe == true) {//piece won't be captured if it moves itself into danger
				gameData.pieces[index].safe = true // mark piece as safe until further notice
			} else {
				if (gameData.pieces[index].role == 'king') {
					broadcastWin('attacker')
				} else {
					delete gameData.pieces[index]
				}
			}
		}
	}
}

function broadcastWin(team) {
	if (team == 'attacker') {
		gameData.winner = 'attacker'
		alert('ATTACKER WINS!')
		endGame()
	} else {
		gameData.winner = 'defender'
		alert('DEFENDER WINS!')
		endGame()
	}
}
