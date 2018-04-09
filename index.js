const moment = require('moment');
const request = require('superagent');
const chalk = require('chalk');
const fs = require('fs');
const jsonfile = require('jsonfile');
const sleep = require('sleep');
const Throttle    = require('superagent-throttle')

let throttle = new Throttle({
  active: true,     // set false to pause queue
  rate: 5,          // how many requests can be sent every `ratePer`
  ratePer: 20000,   // number of ms in which `rate` requests may be sent
  concurrent: 1     // how many requests can be sent concurrently
})



var currentDate = moment().hour(0).minute(0).second(0);
console.log( chalk.yellow( 'Start date: %s'), currentDate.format() );

var workingDate = moment(currentDate);

var targetDate = moment(currentDate).subtract(2, 'years');
console.log( chalk.blue( 'Target date: %s'), targetDate.format() );

do{
	console.log( chalk.blue( 'Top date: %s'), workingDate.format() );
	var bottomDate = moment( workingDate ).subtract(1, 'days');
	console.log( chalk.magenta( 'Bottom date: %s'), bottomDate.format() );
	var currentSQL = fs.readFileSync(__dirname + '/query.sql', 'UTF-8');
	var queryData = currentSQL.replace('__BOTTOM_DATE__', bottomDate.format()).replace('__TOP_DATE__', workingDate.format()).replace("\n", " ");
	
	getDotaData(queryData, workingDate.format('YYYY-MM-DD'), bottomDate.format('YYYY-MM-DD'));

	workingDate.subtract(1, 'days');


}
while( workingDate.unix() != targetDate.unix());


function getDotaData(queryData, topDate, bottomDate){
	var file = [ 
		__dirname,
		'/datasets/matches/',
		topDate,
		'_',
		bottomDate,
		'.json'
	].join("");
	request
		.get('https://api.opendota.com/api/explorer')
		.query({ sql : queryData })
		.use(throttle.plugin())
		.end(function(err, data){
			if(err){
				console.log( chalk.red( 'API error: %s'), err );
			} else {
				console.log( chalk.bgMagenta.black( 'Got date: %s'), topDate );
				jsonfile.writeFile(file, data.body.rows, {spaces: 2}, function (err) {
	  				if(err){
	  					console.log( chalk.red( 'File error: %s'), err );
	  				} else {
	  					console.log( chalk.bgGreen.black( 'Saved: %s'), file );
	  				}
				})
			}
		})
}