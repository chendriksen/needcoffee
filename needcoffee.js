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
  // if current weight is reading close to zero
  if (weight - zero < 5) {
    calibrated = true;
    led.off();
    console.log("You can add the coffee now!")
    fs.writeFile('logfile.csv', "date ,"+"time ,"+"weight ,"+"\n", function (err) {});
  // else do some more calibrating
  } else {
    console.log("still working...")
    setTimeout(calibrate,15000);
  }
}

function measure() {
  // check that there's actually weight on the scales
  if ((latestReading - zero) > 4) {
	  allReadings.push(latestReading);
    console.log(latestReading);
  } else {
    console.log("NOTE: No coffee detected")
  }
}

function updateLog() {
  // Slice point is number of values to be taken into calculations (4)
  var arr = allReadings.slice(-4);
  var currentWeight = arr.reduce(function(a, b){ return a + b; }, 0) / (arr.length || 1);
  currentWeight = (currentWeight- zero);
  hourlyLog.push(currentWeight);
}

function updateForecast() {
  return false;
}

function needCoffee() {
  updateLog();
  // should use hourlyLog to calculate rate of consumption, and forecast hours until running out
  orderRequired = updateForecast();
  // if it's the time to re-order coffee (based on forecast) order more coffee
  if (orderRequired) {
    // order coffee (with a tweet)
  }
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
  	};
  });

  // LED to notify of calibration
  led.on();

  // Wait 30 seconds to calibrate scales (30000)
  console.log("calibrating.... (please wait for light to switch off)");
  setTimeout(calibrate,30000);

  // Start logging each 5 minutes (300000)
  setInterval(measure,300000);

  // Start actioning on measurements each 1 hour(s) (3600000)
  setInterval(needCoffee,3600000);

});

