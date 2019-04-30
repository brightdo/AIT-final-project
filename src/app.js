const express = require('express');
const app = express();
const path = require('path');
const passport = require('passport');
require('./db.js');
require('./users.js');
require('./config/passport')(passport);
const mongoose = require('mongoose');
const Class = mongoose.model('Class');
const Book = mongoose.model('textbook');
const User = mongoose.model('User');
const session = require("express-session");
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');



app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
  secret: "secret",
  resave: true,
  saveUniinitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req,res,next)=>{
  res.locals.login_error = req.flash('error');
  next();
});

const bodyParser = require('body-parser'); app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

  app.set('view engine', 'hbs');

  app.get('/',(req,res)=>{
    res.redirect('/search');
  });

  app.get('/addClass', (req,res) =>{

if(req.user !== undefined){
    if(req.user.modify){
      if(req.isAuthenticated()){
        res.render('addClass');
      }
    }
    else{
    res.write("you dont have access authority for this page");
    res.end();
  }
}
else{
    res.write("please log in with access authority");
    res.end();
  }

    });

  app.post('/addClass', (req,res) =>{
    const name = req.body.name;
    const professor = req.body.professor;
    const classNumber = req.body.classNumber;

    //check for user error input
    const error=[];
    if(name === "" || name === undefined){
      error.push('please input name of class');
    }
    if(professor === "" || professor === undefined){
      error.push('please input professor for class');
    }
    if(classNumber === "" || classNumber === undefined){
      error.push('please input class number');
    }
    if(error.length >0){
      res.render('addClass', {message: error});
    }
    else{
    new Class({
      name:name,
      professor:professor,
      classNumber:classNumber
  }).save(function(err) {
      if (err) {console.log(err);
      }
      else{
      res.render('addClass', {success: "success adding class"});
      }
      });
    }
    });

    app.get('/removeClass', (req,res)=>{
      if(req.user !== undefined){
        if(req.user.modify){
          if(req.isAuthenticated()){
        res.render('removeClass');
          }
        }
        else{ 
          res.write("you dont have access authority for this page");
          res.end();
      }
    }
    else{
        res.write("please log in with access authority");
        res.end();
      }
    });

    app.post('/removeClass', (req,res) =>{
      const classNumber = req.body.classNumber;

      if(classNumber === ' ' || classNumber === undefined){
        res.render('removeClass', {noClass_msg: "please input a value for classNumber"});
      }

      try{
      Class.findOneAndDelete(
        {classNumber:classNumber}, function(err,myclass){
          if(err){
            console.log(err);
          }
          if(myclass === null){
            res.render('removeClass', {noClass_msg:"class with class number " + classNumber + " does not exist"});
          }
          else{
            res.render('removeClass', {success_msg: "success removing class from the list"});
          }
          // res.redirect('/search');
        });
      }
      catch(e){
        console.log(e);
      }

      });

    app.get('/search', (req,res) =>{

      if(req.query.value === "" || req.query.value === undefined){
      Class.find({}, function(err, myclasses) {
          if(err){
              console.log(err);
          }
          else{
              res.render('showClasses', {myclasses:myclasses});
          }
      });
      }
      else{
          const filter = req.query.filter;
          const value = req.query.value;  
          if(filter === "name"){
          Class.find({name:value}, function(err,myclasses){
              if(err){
                  console.log(err);
              }
              else{
                res.render('showClasses', {myclasses:myclasses});
              }
          });
      }
      else if( filter === "professor" ){
              Class.find({professor:value}, function(err,myclasses){
                  if(err){
                      console.log(err);
                  }
                  else{
                    res.render('showClasses', {myclasses:myclasses});}
              });
      }
      else{
        Class.find({classNumber:value}, function(err,myclasses){
          if(err){
              console.log(err);
          }
          else{
            res.render('showClasses', {myclasses:myclasses});
          }
      });
      }
    }
      });


  app.get('/bootstrap', (req,res)=>{
    res.render("bootstrap-research");
  });
  
  app.get('/signup', (req,res)=>{
    res.render("signup");
  });
    app.get('/classinfo/:name', (req,res)=>{
      let modify = false;
      if(req.user !== undefined){
      if( req.user.modify === true){
        modify = true;
      }
    }
      Class.findOne({name: req.params.name},function(err,myclass){
        if(err){
            console.log(err);
        }
        else{
            res.render("classinfo", {class:myclass, modify:modify});
            }
          });
    });

    app.post('/signup', (req,res)=>{
      const {name, email, password, password2} = req.body;

      const error =[];
      if(password !== password2){
        error.push("passwords do not match");
      }
      if(password.length < 7){
        error.push('password must be at least 7 characters');
      }

      if( error.length >0){
        res.render('signup', {error:error, name:name, email:email, password:password, password2:password2});
      }
      else{
        User.findOne({email:email})
        .then(user => {
          if(user){
            error.push('user already exist');
            //existing user
            res.render('signup', {error:error, name:name, email:email, password:password, password2:password2});
          }
          else{
            const newUser = new User({
              name: name,
              email: email,
              password: password
            });
            // Hash password
            bcrypt.genSalt(10, (err, salt)=> 
              bcrypt.hash(newUser.password, salt, (err,hash)=>{
                if(err){
                  console.log(err);
                }
                else{
                newUser.password = hash;
                newUser.save(function(err) {
                  if (err) {console.log(err);
                  }
                  else 
                  {res.redirect('/login');
                  }
              });
                }
            }));

          }
        });
      }

    });
    app.get('/login', (req,res)=>{
      res.render('login');
    });

    app.post('/login', (req,res,next)=>{
      passport.authenticate('local',{
        successRedirect: '/list',
        failureRedirect: '/login',
        failureFlash: true
      })(req,res,next);
    });



    
    app.post('/add-book', (req,res)=>{
      
      function ClassBook(){
        this.title=req.body.title;
        this.edition=req.body.edition;
        this.author=req.body.author;
        this.isbn=req.body.isbn;
      }

      function CreateMongooseBook(){
        ClassBook.call(this);
      }

      CreateMongooseBook.prototype = Object.create(ClassBook.prototype);

      CreateMongooseBook.prototype.constructor = CreateMongooseBook;

      CreateMongooseBook.prototype.createBook = function(){
            return new Book({
            title:this.title,
            edition:this.edition,
            author:this.author,
            isbn:this.isbn
          });
      };
      const newBook = new CreateMongooseBook(req.body);

       Class.findByIdAndUpdate(req.body.id, { "$push": { textbook: newBook.createBook()} }, { "new": true }, (err) => {
        if(err){
            res.status = 500;
            res.json(err);
        }
        else{
            const returned = {
             "success": "Added a new question",
            };
            res.json(returned);
        }
      // send back JSON (for example, updated objects... or simply a message saying that this succeeded)
      // ...if error, send back an error message ... optionally, set status to 500
    });
    });

    app.post("/remove-book", (req,res)=>{
      const id = req.body.id;
      const isbn = req.body.isbn;
      Class.findByIdAndUpdate(id, { "$pull": { textbook: {isbn: isbn}} }, { "new": true }, (err) => {
        if(err){
            res.status = 500;
            res.json(err);
        }
        else{
            const returned = {
             "success": "Added a new question",
            };
            res.json(returned);
        }
    });    
  });

    //handle log out
    app.get('/logout', (req, res)=>{
      req.logout();
      res.redirect('/login');
    });
    

    app.post('/add-book-to-list', (req,res)=>{
      
      const myuser=req.user;
      console.log(myuser);
      const received = req.body.book;
      const parsed = received.split(",");
      console.log(parsed);
      const title = parsed[0];
      const edition = parsed[1];
      const author = parsed[2];
      const isbn = parsed[3];
      
      class AddedBook{
        constructor(title,edition,author,isbn){
          this.title = title;
          this.edition = edition;
          this.author =author;
          this.isbn = isbn;
        }
      }
      const mine = new AddedBook(title,edition,author,isbn);
      console.log(mine);
      console.log(typeof(mine));


      if(req.user === undefined){
        res.send('/login');
      }
      else{
      User.findByIdAndUpdate(req.user.id, { "$push": { lists: mine} }, { "new": true }, (err) => {
        if(err){
          console.log(err);
        }
        else{
          console.log("success");
        }
      });
    }
    });

    app.post('/remove-book-list', (req,res)=>{
      const isbn = req.body.isbn;

      User.findByIdAndUpdate(req.user.id, { "$pull": { lists: {isbn: isbn}} }, { "new": true }, (err) => {
        if(err){
          console.log(err);
        }
        else{
          res.send("success");
        }
      });
    });

    app.get('/list', (req,res)=>{
      res.render('userList', {user:req.user});
    });

    app.post('/update-professor', (req,res)=>{
     const newProfessor = req.body.newProf;
      const id = req.body.id.trim();
      const className = req.body.className.trim();
      console.log(id);
      console.log(newProfessor);
      console.log(className);
       Class.findByIdAndUpdate(id, {professor:newProfessor},(err)=>{
         if(err){
           console.log(err);
         }
         else{
           res.send('success');
         }
       });
    });

    app.get('/bookinfo/:name', (req,res)=>{
      const bookinfo = req.params.name;
      const parse = bookinfo.split('-');
      const trimTitle = parse[0].replace(/ /g,'');
      console.log(trimTitle); 
      const myBook = {
        title:parse[0],
        edition:parse[1],
        author:parse[2],
        isbn:parse[3],
        img:trimTitle
      };
      res.render('bookinfo', {book:myBook});
        });


    app.listen(process.env.PORT || 3000);

