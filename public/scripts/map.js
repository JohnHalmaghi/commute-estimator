const GOOGLE_API_KEY = config.GOOGLE_API_KEY; 
var directionsService;
var directionsRenderer;


/*TODO:
    - Input Validation
    - calulate commute home
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
    var directionsService = new google.maps.DirectionsService();
    const homeAddress = document.getElementById('homeAddress').value;
    const workAddress = document.getElementById('workAddress').value;
    var leaveHomeTime;
    var timeAtWork;

    //get work start time
    leaveHomeTime = document.getElementById('departureTime').value;
    
    //get work end time
    timeAtWork = document.getElementById('timeAtWork').value;
    
    const nextMonday = getNextMondayDate(leaveHomeTime);

    var directionsRequest = {
        origin: homeAddress,
        destination: workAddress,
        travelMode: 'DRIVING',
        drivingOptions: {
            departureTime: nextMonday,
            trafficModel: 'bestguess',
        }
    }
    directionsService.route(directionsRequest, function(result, status) {
        if(status === 'OK'){
            console.log(result);
            directionsRenderer.setDirections(result);
            var durationInTraffic = parseInt(result.routes[0].legs[0].duration_in_traffic.text.split(' ')[0]);
            var departureTime = result.request.drivingOptions.departureTime;
            var arriveAtWork = new Date(departureTime.getTime() + durationInTraffic*60000);
            debugger;
        } else {
            alert('DirectionsService route failed with status ' + status);
        }
    })
    //calculate commute mon-fri
    //average
    //repeat calculation for +- 30/60 mins
    //update input area
}

function calculateArrivalTime(commuteTime){
    var arrivalTime = new Date(nextMonday.getTime() + durationInTraffic*60000);
    return arrivalTime
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
mapsImport.src = "https://maps.googleapis.com/maps/api/js?key=" + GOOGLE_API_KEY + "&libraries=places&callback=initMap"
mapsImport.async = true;
mapsImport.defer = true;
document.body.appendChild(mapsImport);