const express = require('express');
const app = express();
const bodyParser = require('body-parser'); 
const { MongoClient } = require('mongodb');
const { reset } = require('nodemon');
const { response } = require('express');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

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
  res.sendFile(__dirname + '/index.html')
}); 

app.get('/write', function(req, res){
  res.sendFile(__dirname + '/write.html')
}); 

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

app.delete('/delete', (req, result) => {
  console.log(req.body)
  req.body._id = parseInt(req.body._id);
  db.collection('post').deleteOne(req.body, (err, res)=>{
    console.log('삭제완료');
    result.status(200).send({message: '삭제 성공!'})
  });
});