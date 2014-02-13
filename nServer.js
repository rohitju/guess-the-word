var http = require('http').createServer(handler);
var Firebase = require('firebase');
var fs = require('fs');
var io = require('socket.io').listen(http);

var port = Number(process.env.PORT || 5000);
http.listen(port);

function handler (req, res) {
  res.writeHead(200, {'Content-Type': 'text/'});
  res.end('Hello World\n');
}
var myRootRef = new Firebase('https://burning-fire-1412.firebaseio.com/-JFVjzKY45C_Lx6lhhQY');
var wordArray = fs.readFileSync('res/dict.txt').toString().split(" ");
setTimer();
var myInterval;
var randWord;
function setNewWord(){
randWord = wordArray[Math.floor(Math.random() * wordArray.length)];
var shuffledWord = randWord.split("");
n = shuffledWord.length;
for(var i = n - 1; i > 0; i--) {
	var j = Math.floor(Math.random() * (i + 1));
	var tmp = shuffledWord[i];
	shuffledWord[i] = shuffledWord[j];
	shuffledWord[j] = tmp;
}
var puzzleWord = shuffledWord.join(" ");
myRootRef.set({answer:randWord, challenge:puzzleWord});
console.log("New word is set");
}

function setTimer(){
myInterval = setInterval(setNewWord,60000);
}

function resetTimer(){
clearInterval(myInterval);
setTimeout(setNewWord, 10000);
myInterval = setInterval(setNewWord, 60000);
console.log("Timer is reset");
}

io.sockets.on('connection', function(socket){

socket.on('correctAnswer', function(data){
console.log("Correct answer was received");
io.sockets.emit('nextRound', {username:data.username, answer:randWord});
resetTimer();
console.log(data.username);
});

socket.on('guess', function(data){
io.sockets.emit('guessEntered', {username:data.username, guess:data.g});
console.log("Somebody guessed "+data.username+":"+data.g);
})
});

console.log('Server running at http://127.0.0.1:1337/');