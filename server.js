// Declare variables
var serverURL = null
var serverURLPath = null
var serverId = null

var rules = {
	wallCapture: null,
	defendersMayBoardShips: null,
	surroundKingCapture: null,

	board: '11x11',

	turn: 'attacker',
	boardLayouts: {
		'11x11': [
			[4, 0, 0, 3, 3, 3, 3, 3, 0, 0, 4],
			[0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[3, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3],
			[3, 0, 0, 0, 2, 2, 2, 0, 0, 0, 3],
			[3, 3, 0, 2, 2, 1, 2, 2, 0, 3, 3],
			[3, 0, 0, 0, 2, 2, 2, 0, 0, 0, 3],
			[3, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
			[4, 0, 0, 3, 3, 3, 3, 3, 0, 0, 4]
		],
		'11x11_debug': [
			[4, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4],
			[0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0],
			[3, 3, 0, 0, 0, 1, 0, 0, 0, 3, 3],
			[0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
			[4, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4]
		]
	}
}

if (window.location.hash) {
	joinGame(window.location.hash.slice(1,window.location.hash.length))
}

//* START A NEW GAME
function setupNewGame() {
	rules.wallCapture = document.querySelector('#wall-capture').checked
	rules.defendersMayBoardShips = document.querySelector('#defenders-may-board-ships').checked
	rules.surroundKingCapture = document.querySelector('#surround-king').checked

	rules.board = document.querySelector('#board-select').value

	myTeam = 'attacker'
	renderGameGrid(true) // 'true': set up game data while we render the grid
	renderPieces()

	new JSONBlobRequest().post({ rules, gameData }, function (err, res) { // set up the server
		serverURL = res.location.replace('http', 'https') // get the server URL and make the link secure
		initialDataLoad()
	})
}

//* JOIN AN EXISTING GAME
function joinGame(id) {
	serverURL = 'https://jsonblob.com/api/jsonBlob/' + id
	myTeam = 'defender'

	initialDataLoad()
}

function initialDataLoad() {
	serverURLPath = serverURL.split('/') //get url subpages
	serverId = serverURLPath[5] // get the actual server ID
	document.title = 'Play TAFL Online'
	document.querySelector('#server-url').innerHTML = window.location.hostname+'#'+serverId // display this for later use
	document.querySelector('#server-id').innerHTML = `ID: ${serverId}`
	document.querySelector('#settings-container').style.display = 'none'
	document.querySelector('#challenge-container').style.display = 'block'

	new JSONBlobRequest().get(serverURL, function (err, cb) { // make the first GET request to load data
		rules = JSON.parse(cb.text).rules
		gameData = JSON.parse(cb.text).gameData

		renderGameGrid(false) // draw the grid but don't modify game data
		renderPieces() //draw the pieces while we wait for subsequent GET requests
		//* OFF TO THE RACES
		setInterval(function () { // start up a timer to check for opponent's moves; 
			if (rules.turn !== myTeam && gameData.winner == null) { // only bother checking when it's their turn 
				getData()
			}
		}, 3000)
	})
}

function submitMove() {
	new JSONBlobRequest().put(serverURL, { rules, gameData }, function (err, cb) {
		getData()
	})
}

function getData() {
	new JSONBlobRequest().get(serverURL, function (err, cb) {
		rules = JSON.parse(cb.text).rules
		gameData = JSON.parse(cb.text).gameData
		if (gameData.winner == null) {
			renderPieces()
		} else if (gameData.winner == 'attacker') {
			broadcastWin('attacker')
		} else if (gameData.winner == 'defender') {
			broadcastWin('defender')
		}
	})
}

function endGame() {
	window.location.reload()
}
