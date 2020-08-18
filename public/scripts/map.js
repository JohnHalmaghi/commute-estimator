const GOOGLE_API_KEY = config.GOOGLE_API_KEY; 
var directionsService;
var directionsRenderer;


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

document.getElementById('submit').addEventListener('click', () => {
    calculateCommute();
})


function calculateCommute() {
    //get home address
    const homeAddress = "5251 Viewridge Court, San Diego, CA, USA"
    const workAddress = "2500 Northside Drive, San Diego, CA, USA"

    //const homeAddress = document.getElementById('homeAddress').value;
    //const workAddress = document.getElementById('workAddress').value;
    var leaveHomeTime;
    var timeAtWork;

    //get work start time
//    leaveHomeTime = document.getElementById('departureTime').value;
    leaveHomeTime = "07:00";
    
    //get work end time
    timeAtWork = 8;

    
    const nextMondayToWork = getNextMondayDate(leaveHomeTime);

    var directionsRequestToWork = generateDirectionsRequest(homeAddress, workAddress, nextMondayToWork);
    var routeToWork = getRouteToWork(directionsRequestToWork, timeAtWork);
//    var trafficToWork = parseInt(routeToWork.routes[0].legs[0].duration_in_traffic.text.split(' ')[0]);
//    var trafficToHome = parseInt(routeToHome.routes[0].legs[0].duration_in_traffic.text.split(' ')[0]);

//    console.log(toWork);
    //calculate commute mon-fri
    //average
    //repeat calculation for +- 30/60 mins
    //update input area
}

function calculateArrivalTime(commuteTime){
    var arrivalTime = new Date(nextMonday.getTime() + durationInTraffic*60000);
    return arrivalTime
}

function getRouteToWork(directionsRequest, timeAtWork){
    var directionsService = new google.maps.DirectionsService();
    directionsService.route(directionsRequest, function(result, status) {
        if(status === 'OK'){
            tripToWork = processTrip(result);
            directionsRenderer.setDirections(result);

            var nextMondayLeaveWork = new Date(tripToWork.arrivalTime);
            console.log(`Arrive at work : ${tripToWork.arrivalTime}`)
            nextMondayLeaveWork.setHours(nextMondayLeaveWork.getHours() + timeAtWork);
            var directionsRequestToHome = generateDirectionsRequest(directionsRequest.destination, directionsRequest.origin, nextMondayLeaveWork);
            getRouteHome(directionsRequestToHome, tripToWork);
        } else {
            alert('DirectionsService route failed with status ' + status);
        }
    })
}

function getRouteHome(directionsRequest, toWork){
    var directionsService = new google.maps.DirectionsService();
    console.log(`Leave Work : ${directionsRequest.drivingOptions.departureTime}`);
    directionsService.route(directionsRequest, function(result, status) {
        if(status === 'OK'){
            tripHome = processTrip(result);
            console.log(`Arrive at home : ${tripHome.arrivalTime}`)
        } else {
            alert('DirectionsService route failed with status ' + status);
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


var mapsImport = document.createElement('script');
mapsImport.src = "https://maps.googleapis.com/maps/api/js?key=" + GOOGLE_API_KEY + "&libraries=places&callback=initMap" //rename to endpoint?
mapsImport.async = true;
mapsImport.defer = true;
document.body.appendChild(mapsImport);