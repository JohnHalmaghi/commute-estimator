const GOOGLE_API_KEY = config.GOOGLE_API_KEY; 
var directionsService;
var directionsRenderer;

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
    
    //show commute on map
    workWeekLeaveHomeTimes = calculateLeaveHomeTimes(leaveHomeTime);

    var directionsRequest = {
        origin: homeAddress,
        destination: workAddress,
        travelMode: 'DRIVING',
        drivingOptions: {
            departureTime: workWeekLeaveHomeTimes[0],
            trafficModel: 'bestguess',
        }
    }
    directionsService.route(directionsRequest, function(result, status) {
        if(status === 'OK'){
            console.log(result);
            console.log(directionsRenderer);
            directionsRenderer.setDirections(result);
        } else {
            alert('DirectionsService route failed with statusL ' + status);
        }
    })
    //calculate commute mon-fri
    //average
    //repeat calculation for +- 30/60 mins
    //update input area
}

function calculateArrivalTime(time){

}

function calculateLeaveHomeTimes(time){
    var hour = time.split(':')[0];
    var mins = time.split(':')[1];
    var d = new Date();
    var day = d.getDay();
    var dif = d.getDate() - day + (day === 0 ? -6:1);
    workWeek = [];
    for(i = 0; i < 5; i++){
        workWeek[i] = new Date(d.setDate(dif+i));
        workWeek[i].setHours(hour);
        workWeek[i].setMinutes(mins);
        //check is date is earlier than current, if so add 1 week
    }
    return workWeek;
}

var mapsImport = document.createElement('script');
mapsImport.src = "https://maps.googleapis.com/maps/api/js?key=" + GOOGLE_API_KEY + "&libraries=places&callback=initMap"
mapsImport.async = true;
mapsImport.defer = true;
document.body.appendChild(mapsImport);