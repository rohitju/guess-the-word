
var Helloworld = cc.Layer.extend({
    isMouseDown:false,
    wordLabel:null,
    sprite:null,
	winnerLabel:null,
	_box1: null,	
	score:null,
	scoreLabel:null,
	guesses:null,
	guessLabel:null,
	
    init:function () {
        this._super();
		this.guesses = [];
		cc.associateWithNative(this, cc.Layer);
        var size = cc.Director.getInstance().getWinSize();
		
        this.wordLabel = cc.LabelTTF.create("", "Arial", 38);
		this.winnerLabel = cc.LabelTTF.create("", "Arial", 18);
		this.guessLabel = cc.LabelTTF.create("", "Arial", 18);
        this.wordLabel.setPosition(size.width / 2, size.height / 2);
		this.winnerLabel.setPosition(300,400);
		this.guessLabel.setPosition(100,300);
        this.addChild(this.wordLabel, 5);	
		this.addChild(this.winnerLabel, 4);	
		this.addChild(this.guessLabel, 1);	
		
		this._box1 = cc.EditBox.create(cc.size(120, 30), cc.Scale9Sprite.create("res/yellow_edit.png"));
        this._box1.setPlaceholderFontColor(cc.c3b(255, 0, 0));
        this._box1.setPlaceHolder("Enter your guess");
        this._box1.setPosition(330, 50);
        this._box1.setDelegate(this);
        this._box1.setFontColor(cc.c3b(5, 4, 10));
        this._box1.setMaxLength(5);
        this.addChild(this._box1,3);
		
		score = 0;
		var menuItem1 = new cc.MenuItemFont.create("Guess",'guessEntered', this);
		var menu = cc.Menu.create(menuItem1);
		menu.setPosition(460,50);
		this.addChild(menu, 2);	
		var sLabel = "Score: "+score;
		this.scoreLabel = cc.LabelTTF.create(sLabel, "Arial", 15);
        this.scoreLabel.setPosition(750, 400);
        this.addChild(this.scoreLabel, 5);	

        var lazyLayer = cc.Layer.create();
        this.addChild(lazyLayer);
        this.sprite = cc.Sprite.create("res/bg.jpg");
        this.sprite.setPosition(size.width / 2, size.height / 2);
        this.sprite.setScale(0.5);

        lazyLayer.addChild(this.sprite, 0);
        this.setTouchEnabled(true);
        return true;
    },
	onChildChanged:function(snapshot){
		this.winnerLabel.setString("");
		var newWord = snapshot.val();
		window.answer = newWord.answer;
		window.challenge = newWord.challenge;
		this.wordLabel.setString(newWord.challenge);
	},
	
	onChildAdded:function(snapshot){
		this.winnerLabel.setString("");
		var newWord = snapshot.val();
		window.answer = newWord.answer;
		window.challenge = newWord.challenge;		
		this.wordLabel.setString(newWord.challenge);
	},
	nextRound:function(data){
		var winnerString = "User "+data.username+" got the right answer!\nThe right answer is "+data.answer+".The next round will start in a few seconds...";
		this.winnerLabel.setString(winnerString);
		this.wordLabel.setString("");
		this.guessLabel.setString("");
		this.guesses = [];
	},
	guessEntered : function(){
		var guess = this._box1.getText();
		var socket = io.connect('http://quiet-headland-8232.herokuapp.com');
		if(guess == window.answer)
		{
			window.prev = window.answer;
			window.answer = null;
			this.score++;
			this._box1.setText("");
			this.scoreLabel.setString("Score: "+this.score);			
			socket.emit('correctAnswer', {username:window.userName});
		}
		else
		{
			socket.emit('guess', {username:window.userName, g:guess})
		}
	},
	playerGuess : function(data){
		if(this.guesses.length == 10)
		{
			this.guesses.shift();
		}
		this.guesses.push("User "+data.username+" guessed: "+data.guess);
		this.guessLabel.setString(this.guesses.join("\n"));
	},
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {			
        this._super();
		
		var myRootRef = new Firebase('https://burning-fire-1412.firebaseio.com/');
        var firstLayer = new Helloworld();
        firstLayer.init();        
        this.addChild(firstLayer);
		
		myRootRef.on('child_added', function(snapshot){
		firstLayer.onChildAdded(snapshot);
		});
		
        myRootRef.on('child_changed', function(snapshot){
		firstLayer.onChildChanged(snapshot);
		});
		
		var socket = io.connect('http://quiet-headland-8232.herokuapp.com');
		
		socket.on('nextRound', function(data){
		firstLayer.nextRound(data);
		});
		
		socket.on('guessEntered', function(data){
		firstLayer.playerGuess(data);
		})
    }
});

