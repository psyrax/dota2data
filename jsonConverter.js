const filewalker = require('filewalker');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const jsonl = require('jsonl');


var jsonFiles = [];

filewalker(__dirname + '/datasets/matches')
  .on('file', function(p, s) {
    if ( path.extname(p) == '.json' ){
      jsonFiles.push(p);
    }
  })
  .on('done', function() {
    jsonFiles.forEach(function(file, index){
      console.log( chalk.bgGreen.black( 'Converting: %s'), file );
      var fileToSave = [__dirname, '/datasets/matches/jsonl/', path.basename(file, '.json'), '.jsonl'].join("");
      fs.createReadStream(__dirname + '/datasets/matches/' + file)
        .pipe(jsonl())
        .pipe(fs.createWriteStream(fileToSave))
    })
  })
.walk();