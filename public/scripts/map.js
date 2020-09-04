import { sanitize } from 'dompurify';
var GOOGLE_API_KEY = config.GOOGLE_API_KEY; 
var directionsRenderer;
const resultsElement = document.querySelector(".results");
const inputAreaElement = document.querySelector("#inputArea");

window.onload

/*TODO:
    - Calculate departure time +- 30,60 minutes
    - Unit tests?
    - Sanitize input
    - Make responsive
*/

// Initialize and add the map
function initMap() {
    directionsRenderer = new google.maps.DirectionsRenderer();

    var usaCenter = {lat: 39.50, lng: -98.35};

    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 5, center: usaCenter});
    directionsRenderer.setMap(map);
    initializeAutoComplete();
    document.getElementById('submit').addEventListener('click', calculateCommute);
}


function initializeAutoComplete() {
    var homeInput = document.getElementById('homeAddress');
    var workInput = document.getElementById('workAddress')
    new google.maps.places.Autocomplete(homeInput);
    new google.maps.places.Autocomplete(workInput);
}

async function calculateCommute() {
    const homeAddress = sanitize(document.getElementById('homeAddress').value, {
        FORBID_ATTR: ['width', 'height', 'style'],
        FORBID_TAGS: ['style'],
    });
    const workAddress = sanitize(document.getElementById('workAddress').value, {
        FORBID_ATTR: ['width', 'height', 'style'],
        FORBID_TAGS: ['style'],
    });

    const leaveHomeTime = document.getElementById('departureTime').value;
    
    var timeAtWork = document.getElementById('timeAtWork').value;
    timeAtWork = parseTimeAtWork(timeAtWork);
    
    const nextMondayToWork = getNextMondayDate(leaveHomeTime);

    var directionsRequestToWork = generateDirectionsRequest(homeAddress, workAddress, nextMondayToWork);

    getRouteToWork(directionsRequestToWork, timeAtWork);
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
    console.log(route);
    var trip = {
        durationWithTraffic : route.routes[0].legs[0].duration.value,
        durationWithTrafficString: '',
        durationWithoutTraffic : route.routes[0].legs[0].duration_in_traffic.value,
        durationWithoutTrafficString: '',
        timeInTraffic : 0,
        timeInTrafficString: '',
        arrivalTime : new Date(route.request.drivingOptions.departureTime),
    }
    trip.arrivalTime.setTime(trip.arrivalTime.getTime() + trip.durationWithTraffic);
    trip.durationWithoutTrafficString = msToTime(trip.durationWithoutTrafficString);
    trip.durationWithTraffic = msToTime(trip.durationWithTraffic);
    trip.timeInTraffic = trip.durationWithTraffic > trip.durationWithoutTraffic ? trip.durationWithTraffic - trip.durationWithoutTraffic : 0;
    trip.timeInTrafficString = msToTime(trip.timeInTraffic);
    return trip;
}

function msToTime(duration) {
    var minutes = Math.floor((duration / (1000 * 60)) % 60);
    var hours = Math.floor((duration / (1000 * 60 * 60)));
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
  
    return hours + ":" + minutes;

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
    var totalCommute = msToTime(tripToWork.durationWithTraffic + tripHome.durationWithTraffic);
    var totalTimeInTraffic = msToTime(tripToWork.timeInTraffic + tripHome.timeInTraffic);
    const displayHTML = `
    <h2><strong>Commute Summary</strong></h2>
    <hr>
    <h3>Commute To Work</h3>
    <p>Commute Time: ${tripToWork.durationWithTrafficString}</p>
    <p>Commute Time In Traffic: ${tripToWork.timeInTrafficString}</p>
    <h3>Commute Time Home</h3>
    <p>Commute Time: ${tripHome.durationWithTrafficString}</p>
    <p>Commute Time In Traffic: ${tripHome.timeInTrafficString}</p>
    <h3>Total Commute</h3>
    <p>Total Commute: ${totalCommute}</p>
    <p>Total Time In Traffic: ${totalTimeInTraffic}</p>`
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
mapsImport.src = "https://maps.googleapis.com/maps/api/js?key=" + GOOGLE_API_KEY + "&libraries=places&callback=initMap"
mapsImport.async = true;
mapsImport.defer = true;
document.body.appendChild(mapsImport);