let map;

let tracker;

let clientLat = 53.47937674151587;
let clientLng = -2.2450065911312085;

const bottomLeftOfManchesterX = -2.5285321528127502;
const bottomLeftOfManchesterY = 53.35971911352883;
const topRightOfManchesterX = -2.0416134411930216;
const topRightOfManchesterY = 53.62993510115222;
const mapContainer = document.getElementById("map-container");
const findingLocation = document.getElementById("finding-location");
const plantingControls = document.getElementById("planting-controls");
const confirmPlant = document.getElementById("confirm-plant");
const createNew = document.getElementById("create-new");

let userMarker;




const scaleToRange = (input, inputLower, inputUpper, outputLower, outputUpper) => {
    const scaledOutput = ((input - inputLower) / (inputUpper - inputLower) * (outputUpper - outputLower) + outputLower);
    return scaledOutput < outputLower ? outputLower : scaledOutput > outputUpper ? outputUpper : scaledOutput;
};

function initMap() {
  fetch("http://ip-api.com/json").then(res=>res.status == 200 && res.json()).then(data => {
    clientLat = data.lat;
    clientLng = data.lon;
  }).catch(()=>console.log("Failed to guess user's location"));
    map = new google.maps.Map(mapContainer, {
      center: { lat: clientLat, lng: clientLng },
      zoom: 14,
      styles: mapStyle,
      gestureHandling: "greedy",
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      draggable: false,
      disableDefaultUI: true,
    });
        const positionMarker = location => {
          findingLocation.style.opacity = 0;
          findingLocation.style.pointerEvents = "none";
          const userLocation = new google.maps.LatLng({ lat: location.coords.latitude, lng: location.coords.longitude });
          map.setCenter(userLocation)
          map.setZoom(20);
          if (userMarker != undefined) {
            userMarker.setMap(null);
          }
            userMarker = new google.maps.Marker({
              position: userLocation,
              map: map,
              icon: {
                ...plantIcon,
                anchor: new google.maps.Point(8, 8),
              },
              draggable: true,
              raiseOnDrag: false,
              zIndex: 9999
            });
            google.maps.event.addListener(userMarker, 'drag', ()=>navigator.geolocation.clearWatch(tracker));
          }
        confirmPlant.addEventListener("click", event => {
          event.preventDefault();
          const x = scaleToRange(userMarker.position.lng(), bottomLeftOfManchesterX, topRightOfManchesterX, -2048, 2048);
          const z = scaleToRange(userMarker.position.lat(), bottomLeftOfManchesterY, topRightOfManchesterY, -2048, 2048);
          const lat = userMarker.position.lat();
          const lng = userMarker.position.lng();
          const submission = {flagId: storage.getItem("userFlagId"), lat: lat, lng: lng, x: x, z: z }
          fetch(`${location.origin}/plant-flag`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(submission)
          }).then(()=>{
            const plantedMarker = new google.maps.Marker({
              position: new google.maps.LatLng({lat:lat, lng:lng}),
              map: map,
              icon: {
                url: storage.getItem("userDesign"),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(
                  pixelGrid.width,
                  pixelGrid.height
                ),
                zIndex: 0
              },
              draggable: false,
              raiseOnDrag: false,
            });
            navigator.geolocation.clearWatch(tracker);
            userMarker.setMap(null);
            confirmPlant.style.opacity = 0;
            confirmPlant.style.pointerEvents = "none";
          });
        });
        createNew.addEventListener("click", ()=>{
          const confirmNew = confirm("Create a new flag? You won't be able to plant this flag any more if you do.");
          if (confirmNew) {
            navigator.geolocation.clearWatch(tracker);
            mapContainer.style.opacity = 0;
            mapContainer.style.pointerEvents = "none";
            plantingControls.style.opacity = 0;
            plantingControls.style.pointerEvents = "none";
            confirmPlant.style.opacity = 1;
            confirmPlant.style.pointerEvents = "unset";
            context.clearRect(0, 0,  pixelGrid.width, pixelGrid.height);
            storage.removeItem("userDesign");
            storage.removeItem("userFlagId");
          }
        })
        tracker = navigator.geolocation.watchPosition(positionMarker);
        mapContainer.style.opacity = 1;
        plantingControls.style.opacity = 1;
        findingLocation.style.opacity = 1;
        mapContainer.style.pointerEvents = "unset";
        plantingControls.style.pointerEvents = "unset";
        findingLocation.style.pointerEvents = "unset";
}