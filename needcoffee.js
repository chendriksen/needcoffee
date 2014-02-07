var five = require("johnny-five"),
    board = new five.Board(),
    
    calibrationValues = [],
    calibrated = false,
    zero = 0,
    
    latestReading = 0,
    allReadings = [],
    weight = 0;

function calibrate() {
  zero = calibrationValues.reduce(function(a, b){ return a + b; }, 0) / (calibrationValues.length || 1);
  calibrated = true;
  led.off();
  console.log("You can add the coffee now!")
  fs.writeFile('logfile.csv', "date ,"+"time ,"+"weight ,", function (err) {});
}

function measure() {
	weight = (latestReading-zero)*2.09
	allReadings.push(weight);
	console.log(weight);
}

function needCoffee() {
  // Slice point needs to be number of values logged in last period
  var arr = allReadings.slice(-5);
	currentWeight = arr.reduce(function(a, b){ return a + b; }, 0) / (arr.length || 1);
	var currentdate = new Date(); 
	var datetime = currentdate.getDate() + "/"
	    + (currentdate.getMonth()+1)  + "/" 
	    + currentdate.getFullYear() + " , "  
	    + currentdate.getHours() + ":"  
	    + currentdate.getMinutes() + ":" 
	    + currentdate.getSeconds();
	fs.appendFile('logfile.csv', datetime+' , '+currentWeight+'\n', function (err) {});

}

board.on("ready", function() {

  // Set up LED for calibration warning
  led = new five.Led({
    pin: 13
  });

  // Set up analog pin
  this.pinMode(5, five.Pin.ANALOG);

  // triggers every time analog pin produces reading
  this.analogRead(5, function(voltage) {
  	latestReading = voltage;
  	if (calibrated == false) {
  		calibrationValues.push(voltage);
  	}
  });

  // LED to notify of calibration
  led.on();
  console.log("calibrating.... (please wait for light to switch off)");

  // Wait 60 seconds to calibrate scales (60000)
  setTimeout(calibrate,6000);

  // Start logging each minute (60000)
  setInterval(measure,60000);

  // Start actioning on measurements each 30 mins (1800000)
  needCoffee();
  setInterval(needCoffee,300000);

});

