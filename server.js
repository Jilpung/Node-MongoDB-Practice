const express = require('express');
const app = express();
const bodyParser = require('body-parser'); 
const { MongoClient } = require('mongodb');
const { reset } = require('nodemon');
const { response } = require('express');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session =require('express-session');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static('public'));
app.use(methodOverride('_method-override'))
app.use(session({secret : '비밀코드', resave: true, saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());
let db;

MongoClient.connect('mongodb+srv://admin:admin@cluster0.o6fiw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', (err, client) => {
  if(err) return console.log(err);

  db = client.db('todoapp');

  // db.collection('post').insertOne({_id:1, name: 'kim', age: 31}, (err, res) => {
  //   console.log('저장완료')
  // });

  app.listen(8080, function(){
    console.log('node start')
  });
  
})

app.get('/pet', function(req, res){
  res.send('pet store')
}); 

app.get('/', function(req, res){
  db.collection('post').findOne({_id:req.body}, (err, res)=>{
    console.log(res);
    res.render('index.ejs', {data:res})
})}); 

app.get('/write', function(req, res){
  db.collection('post').findOne({_id:req.body}, (err, res)=>{
    console.log(res);
    res.render('write.ejs', {data:res})
})}); 

app.post('/add', ( req, result) => {
  db.collection('counter').findOne({name: '게시물 갯수'}, (err, res) => {
    let totalPosts = res.totalPost;

    db.collection('post').insertOne({_id: totalPosts + 1, title: req.body.title, date: req.body.date}, (err, 결과)=> {
      db.collection('counter').updateOne({name: '게시물 갯수'},{ $inc: {totalPosts: 1} }, (err, 결과) => {
        if(err) {return console.log(err)};
      });
    });
    result.send('add id 전송까지 완료');
  });
}); 

app.get('/list', (req, res)=>{
  //데이터를 다 찾는 
  db.collection('post').find().toArray((err, result) =>{
    console.log(result);
    res.render('list.ejs', {posts: result});
  });
});

app.delete('/delete', (req, res) => {
  console.log(req.body)
  req.body._id = parseInt(req.body._id);
  db.collection('post').deleteOne(req.body, (err, result)=>{
    console.log('삭제완료');
    res.status(200).send({message: '삭제 성공!'})
  });
});

app.get('/detail/:id', (req, res)=>{
  db.collection('post').findOne({_id:parseInt(req.params.id)}, (err, result)=>{
    console.log(res);
    res.render('detail.ejs', {data:result})
  });
});

app.get('/edit:id', (req, res)=>{
  db.collection('post').findOne({_id: parseInt(req.params.id)}, (err, result)=>{
    res.render('edit.ejs', {post:result})
  })
})

app.put('/edit', (req, res)=>{
  db.collection('post').updateOne({_id:parseInt(req.body.id)},{$set:{title:req.body.title, date:req.body.date}},(err, result)=>{
    console.log('수정완료');
    res.redirect('/list')
  })
})

app.get('/login', (err, res)=>{
  res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
  failureRedirect : '/fail'
}), (err, res)=>{
  res.redirect('/')
})

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (inputId, inputPw, done) {
  //console.log(inputId, inputPw);
  db.collection('login').findOne({ id: inputId }, function (err, result) {
    if (err) return done(err)

    if (!result) return done(null, false, { message: '존재하지않는 아이디요' })
    if (inputPw == result.pw) {
      return done(null, result)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));