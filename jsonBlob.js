// Prebuilt request manager for JSONBlob.

function JSONBlobRequest() {
	// Initialize new XMLHttpRequest method.
	this.http = new XMLHttpRequest();
}

// PUT FUNCTION
JSONBlobRequest.prototype.put = function (serverURL, data, callback) {
	this.http.open('PUT', serverURL.replace('http://','https://'), true); // Check that request is secure
	this.http.setRequestHeader(
		'Content-type', 'application/json');
	let self = this;
	this.http.onload = function () {
		let response = new Object()
		response.headers = self.http.getAllResponseHeaders()
		response.text = self.http.responseText
		console.log('PUT request successful')
		callback(null, response);
	}

	this.http.send(JSON.stringify(data));
}

// GET FUNCTION
JSONBlobRequest.prototype.get = function (serverURL, callback) {
	this.http.open('GET', serverURL.replace('http://','https://'), true); // Check that request is secure
	this.http.setRequestHeader(
		'Content-type', 'application/json');
		this.http.setRequestHeader("Access-Control-Allow-Origin", "https://jsonblob.com/");

	let self = this;
	this.http.onload = function () {
		let response = new Object()
		response.headers = self.http.getAllResponseHeaders()
		response.text = self.http.responseText
		console.log('GET request successful')
		callback(null, response);
	}

	this.http.send();
}

// POST FUNCTION
// WARNING: For POST requests, body is set to null by browsers.
JSONBlobRequest.prototype.post = function (data, callback) {
	this.http.open('POST', 'https://jsonblob.com/api/jsonBlob', true); // Check that request is secure
	this.http.setRequestHeader('Content-type', 'application/json');
	this.http.setRequestHeader("Accept", "application/json");
	this.http.setRequestHeader("Access-Control-Allow-Origin", "https://jsonblob.com/");
	let self = this;
	this.http.onload = function () {
		let response = new Object()
		response.location = self.http.getResponseHeader('Location')
		response.text = self.http.responseText
		console.log('POST request successful')
		callback(null, response);
	}

	this.http.send(JSON.stringify(data));
}

// DELETE FUNCTION
JSONBlobRequest.prototype.delete = function (serverURL, callback) {
	this.http.open('GET', serverURL.replace('http://','https://'), true); // Check that request is secure
	this.http.setRequestHeader("Access-Control-Allow-Origin", "https://jsonblob.com/");
	let self = this;
	this.http.onload = function () {
		let response = self.http.response
		callback(null, response);
	}

	this.http.send();
}