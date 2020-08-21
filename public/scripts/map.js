const GOOGLE_API_KEY = config.GOOGLE_API_KEY; 
var directionsService;
var directionsRenderer;
const resultsElement = document.querySelector(".results");
const inputAreaElement = document.querySelector("#inputArea");


/*TODO:
    - Input Validation
    - calulate commute home
    - Add async/wait/AJAX
    - Calculate departure time +- 30,60 minutes
    - Update display when request is made
    - Unit tests?
*/
// Initialize and add the map
function initMap() {
    directionsRenderer = new google.maps.DirectionsRenderer();

    var usaCenter = {lat: 39.50, lng: -98.35};

    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 5, center: usaCenter});
    directionsRenderer.setMap(map);
    initializeAutoComplete();
}


function initializeAutoComplete() {
    var homeInput = document.getElementById('homeAddress');
    var workInput = document.getElementById('workAddress')
    new google.maps.places.Autocomplete(homeInput);
    new google.maps.places.Autocomplete(workInput);
}

document.getElementById('submit').addEventListener('click', calculateCommute);


function calculateCommute() {
    //get home address
    const homeAddress = "5251 Viewridge Court, San Diego, CA, USA"
    const workAddress = "2500 Northside Drive, San Diego, CA, USA"

    //const homeAddress = document.getElementById('homeAddress').value;
    //const workAddress = document.getElementById('workAddress').value;

    //get work start time
    //const leaveHomeTime = document.getElementById('departureTime').value;
    leaveHomeTime = "07:00";
    
    //get work end time
    //var timeAtWork = document.getElementById('timeAtWork').value;
    //timeAtWork = parseTimeAtWork(timeAtWork);
    var timeAtWork = 8;
    timeAtWork = parseTimeAtWork(timeAtWork)

    
    const nextMondayToWork = getNextMondayDate(leaveHomeTime);

    //validate input
    var directionsRequestToWork = generateDirectionsRequest(homeAddress, workAddress, nextMondayToWork);
    getRouteToWork(directionsRequestToWork, timeAtWork);
    //calculate +- 30mins and compare?
}

function calculateArrivalTime(commuteTime){
    var arrivalTime = new Date(nextMonday.getTime() + durationInTraffic*60000);
    return arrivalTime
}

function parseTimeAtWork(number){
    var mod = number % 1;
    var mins = mod * (60 * 1000);
    var hours = (number - mod) * (60 * 60 * 1000);
    return mins + hours;
}

function getRouteToWork(directionsRequest, timeAtWork){
    var directionsService = new google.maps.DirectionsService();
    directionsService.route(directionsRequest, function(result, status) {
        if(status === 'OK'){
            tripToWork = processTrip(result);
            directionsRenderer.setDirections(result);

            var nextMondayLeaveWork = new Date(tripToWork.arrivalTime);
            nextMondayLeaveWork.setTime(nextMondayLeaveWork.getTime() + timeAtWork);
            var directionsRequestToHome = generateDirectionsRequest(directionsRequest.destination, directionsRequest.origin, nextMondayLeaveWork);
            getRouteHome(directionsRequestToHome, tripToWork);
        } else {
            console.log(`DirectionsService route failed with status ${status}`);
            console.log(`Failed directions request: ${directionsRequest}`);
            alert("Invalid Input, please try again");
        }
    })
}

function getRouteHome(directionsRequest, toWork){
    var directionsService = new google.maps.DirectionsService();
    directionsService.route(directionsRequest, function(result, status) {
        if(status === 'OK'){
            tripHome = processTrip(result);
            displayResults(toWork, tripHome);
        } else {
            console.log(`DirectionsService route failed with status ${status}`);
            console.log(`Failed directions request: ${directionsRequest}`);
            alert("Invalid Input, please try again");
        }
    })
}

function processTrip(route){
    var trip = {
        durationWithTraffic : parseInt(route.routes[0].legs[0].duration.text.split(' ')[0]),
        durationWithoutTraffic : parseInt(route.routes[0].legs[0].duration_in_traffic.text.split(' ')[0]),
        timeInTraffic : 0,
        arrivalTime : new Date(route.request.drivingOptions.departureTime),
    }
    trip.arrivalTime.setMinutes(trip.arrivalTime.getMinutes() + trip.durationWithTraffic);
    trip.timeInTraffic = trip.durationWithTraffic - trip.durationWithoutTraffic;
    return trip;
}

function generateDirectionsRequest(homeAddress, workAddress, departTime){
    return {
        origin: homeAddress,
        destination: workAddress,
        travelMode: 'DRIVING',
        drivingOptions: {
            departureTime: departTime,
            trafficModel: 'bestguess',
        }
    }
}

function getNextMondayDate(time){
    var hour = time.split(':')[0];
    var mins = time.split(':')[1];
    var nextMonday = new Date();
    var day = nextMonday.getDay();
    nextMonday.setDate(nextMonday.getDate() + (8-day));
    nextMonday.setHours(hour);
    nextMonday.setMinutes(mins);
    return nextMonday;
}

function setDisplayToNone(element){
    element.style.display = "none";
}

function setDisplayToBlock(element){
    element.style.display = "block";
}

function displayResults(tripToWork, tripHome){
    const displayHTML = `
    <h2><strong>Commute Summary</strong></h2>
    <hr>
    <h3>Commute To Work</h3>
    <p>Commute Time: ${tripToWork.durationWithTraffic} Minutes</p>
    <p>Commute Time In Traffic: ${tripToWork.timeInTraffic} Minutes</p>
    <h3>Commute Time Home</h3>
    <p>Commute Time: ${tripHome.durationWithTraffic} Minutes</p>
    <p>Commute Time In Traffic: ${tripHome.timeInTraffic} Minutes</p>
    <h3>Total Commute</h3>
    <p>Total Commute: ${tripToWork.durationWithTraffic + tripHome.durationWithTraffic} Minutes</p>
    <p>Total Time In Traffic: ${tripToWork.timeInTraffic + tripHome.timeInTraffic} Minutes</p>`
    //add color to time in traffic output?

    resultsElement.innerHTML = displayHTML + resultsElement.innerHTML;

    document.getElementById('reset').addEventListener('click', reset);

    setDisplayToNone(inputAreaElement);
    setDisplayToBlock(resultsElement);
}

function reset(){
    setDisplayToBlock(inputAreaElement);
    clearInput();
    setDisplayToNone(resultsElement);
    clearResults();
    initMap();
}

function clearResults(){
    resultsElement.innerHTML = `<button id="reset">Reset</button>`;
}

function clearInput(){
    var inputElements = document.getElementsByTagName("input");
    for (var i=0; i < inputElements.length; i++) {
        if (inputElements[i].type == "text") {
            inputElements[i].value = "";
        }
        if (inputElements[i].type == "number"){
            inputElements[i].value = "";
        }
        if (inputElements[i].type == "time"){
            inputElements[i].value = "";
        }
    }
}


var mapsImport = document.createElement('script');
mapsImport.src = "https://maps.googleapis.com/maps/api/js?key=" + GOOGLE_API_KEY + "&libraries=places&callback=initMap" //rename to endpoint?
mapsImport.async = true;
mapsImport.defer = true;
document.body.appendChild(mapsImport);