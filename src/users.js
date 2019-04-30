const mongoose = require('mongoose'); 
const 	URLSlugs = require('mongoose-url-slugs');




let User = new mongoose.Schema({
    name:{type:String, required:true},
    email: {type:String, required:true},
    password: { type: String, required: true},
    date:{type:Date, default:Date.now},
    modify:{type:Boolean, default:false},
    lists:[{
        title : String,
        edition: Number,
        author : String,
        isbn: String
         }]
});

User = mongoose.model('User', User);


// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/dhk371';
}

// mongoose.connect('mongodb://localhost/login');
 mongoose.connect(dbconf);