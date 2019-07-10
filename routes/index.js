var express = require('express');
var session = require('express-session');
var router = express.Router();

var Board = require('../models/board');
var Comment = require('../models/comment');

router.use(session({
	secret: 'rmsclstkdrksdmsqjawhldpdy',
	resave: true,
	saveUninitialized: true
   })); //세션 초기설정, 옵션

router.use(session({
	secret: 'rmsclstkdrksdmsqjawhldpdy',
	resave: true,
	saveUninitialized: true
   })
); //세션 초기설정, 옵션

var createSession = function createSession(){
  return function(req, res, next){
    next();
  };
};  //session을 만들고, 세션에 login 또는 logout 넣어주기

router.use(createSession());

/* GET home page. */
router.get('/', function(req, res, next) {
  Board.find({}, function (err, board) {
    console.log(req.session.islogin)
    res.render('index', { title: 'Express', board: board, session:req.session });
  });
});

/* Write board page */
router.get('/write', function(req, res, next) {
    res.render('write', { title: '글쓰기' });
});

/* board insert mongo */
router.post('/board/write', function (req, res) {
  var board = new Board();
  board.title = req.body.title;
  board.contents = req.body.contents;
  board.author = req.body.author;
  board.kind = req.body.kind;

  board.save(function (err) {
    if(err){
      console.log(err);
      res.redirect('/');
    }
    res.redirect('/');
  });
});

/* board find by id */
router.get('/board/:id', function (req, res) {
    Board.findOne({_id: req.params.id}, function (err, board) {
        res.render('board', { title: 'Board', board: board });
    })
});

/* comment insert mongo*/
router.post('/comment/write', function (req, res){
    var comment = new Comment();
    comment.contents = req.body.contents;
    comment.author = req.body.author;
    comment.kind = req.body.kind;

    Board.findOneAndUpdate({_id : req.body.id}, { $push: { comments : comment}}, function (err, board) {
        if(err){
            console.log(err);
            res.redirect('/');
        }
        res.redirect('/board/'+req.body.id);
    });
});

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var dbs;



MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbs = db.db("gsmui");
  });  //mongoDB 연결



router.use(session({
	secret: 'rmsclstkdrksdmsqjawhldpdy',
	resave: true,
	saveUninitialized: true
   })); //세션 초기설정, 옵션

router.get('/logIn', function(req, res){
    res.render('login');
});

router.post('/process/login', (req, res)=>{
    dbs.collection("ui").find({id: req.body.id, password: req.body.password}).toArray(function(err, member){
        if(!member.length){
            res.render('logincheck', {check: '0'})
        } else{
          req.session.islogin = 'login';
            res.render('logincheck', {check: '1'})
        }
    })
    
});

router.get('/logOut', function(req, res){
    req.session.islogin = 'logout'
    res.status(200);
    res.redirect('/');
});

module.exports = router;
