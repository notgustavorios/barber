/* static/js/map.js */
let map;
let markers = [];
const DEFAULT_RADIUS = 50; //miles

async function initMap() {
    // Initialize map with default center
    const { Map } = await google.maps.importLibrary("maps")
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker")

    map = new Map(document.getElementById("map"), {
        center: { lat: 0, lng: 0 },
        zoom: 13,
        mapId: "17737d3fc3949ab1"
    });    
    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                map.setCenter(pos)

                const userMarker = createLocationMarker();

                new AdvancedMarkerElement({
                    map: map,
                    position: {
                        lat: userLat,
                        lng: userLng
                    },
                    content: userMarker
                });

                // Fill the wait list
                loadNearbyBarbers(userLat,userLng);

            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    } 
}
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}
function createLocationMarker(){
    // Create the main location-marker element
    const locationMarker = document.createElement('div');
    locationMarker.className = 'location-marker';
  
    // Create the outer-circle element
    const outerCircle = document.createElement('div');
    outerCircle.className = 'outer-circle';
  
    // Create the pulse element
    const pulse = document.createElement('div');
    pulse.className = 'pulse';
  
    // Create the center-dot element
    const centerDot = document.createElement('div');
    centerDot.className = 'center-dot';
  
    // Append the child elements to the location-marker
    locationMarker.appendChild(outerCircle);
    locationMarker.appendChild(pulse);
    locationMarker.appendChild(centerDot);
  
    // Return the DOM element
    return locationMarker;
  };

async function loadNearbyBarbers(latitude, longitude) {

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker")
    
    // Fetch nearby barbers
    fetch(`/get-nearby-barbers?lat=${latitude}&lng=${longitude}&radius=${DEFAULT_RADIUS}`)
        .then(response => response.json())
        .then(barbers => {
            const barberList = document.getElementById('barber-list');
            barberList.innerHTML = barbers.length ? '' : '<div class="no-results">No barbers found nearby</div>';
            
            // Create markers and list items for each barber
            barbers.forEach(barber => {

                function createWaitListTag(time = 0, unit = 'min') {
                    // Create main container
                    const container = document.createElement('div');
                    container.className = 'marker-container';
                
                    // Create marker div
                    const marker = document.createElement('div');
                    marker.className = 'marker';
                
                    // Create inner marker div
                    const markerInner = document.createElement('div');
                    markerInner.className = 'marker-inner';
                
                    // Create time paragraph
                    const timeP = document.createElement('p');
                    timeP.className = 'time';
                    timeP.textContent = time;
                
                    // Create unit paragraph
                    const unitP = document.createElement('p');
                    unitP.className = 'unit';
                    unitP.textContent = unit;
                
                    // Assemble the elements
                    markerInner.appendChild(timeP);
                    markerInner.appendChild(unitP);
                    marker.appendChild(markerInner);
                    container.appendChild(marker);
                
                    return container;
                }

                // Create wait list tag
                const waitTime = createWaitListTag(17, 'min');

                // Create marker
                const marker = new AdvancedMarkerElement({
                    position: { lat: barber.latitude, lng: barber.longitude },
                    map: map,
                    content: waitTime
                });

                // Create list item
                const barberItem = document.createElement('div');
                barberItem.className = 'barber-item';

                barberItem.innerHTML = `
                    <div class="barber-header">
                        <h3>${barber.name}</h3>
                        <span class="wait-time">${barber.wait_time} min<br><small>EST WAIT</small></span>
                    </div>
                    <p class="address">${barber.address}</p>
                    <div class="barber-details">
                        <span class="status open">Open</span> • Closes 8 PM • <span class="distance">${barber.distance} mi</span>
                    </div>
                `;

                // Add click listener to list item
                barberItem.addEventListener('click', () => {
                    map.panTo({ lat: barber.latitude, lng: barber.longitude });
                    map.setZoom(15);
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                });

                barberList.appendChild(barberItem);
            });
            
        });
}



function openWaitlistModal(barberId) {
    const modal = document.getElementById('waitlist-modal');
    const form = document.getElementById('waitlist-form');
    form.action = `/join-waitlist/${barberId}`;
    modal.style.display = 'block';

    // Close modal when clicking the x
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

/* Add some additional CSS for the Google Maps info window */
const styles = `
    .info-window {
        padding: 10px;
        max-width: 200px;
    }
    
    .info-window h3 {
        margin: 0 0 10px 0;
        color: #2c3e50;
    }
    
    .info-window p {
        margin: 5px 0;
        color: #666;
    }
    
    .btn-sm {
        padding: 5px 10px;
        font-size: 12px;
    }
    .barber-item {
        display: flex;
        flex-direction: column;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 15px;
        margin-bottom: 10px;
        background-color: #fff;
    }

    .barber-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .barber-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
    }

    .barber-header .wait-time {
        text-align: right;
        font-size: 16px;
        color: #28a745;
        font-weight: bold;
    }

    .barber-header .wait-time small {
        font-size: 12px;
        color: #6c757d;
    }

    .address {
        font-size: 14px;
        margin: 5px 0;
        color: #6c757d;
    }

    .barber-details {
        font-size: 14px;
        color: #6c757d;
        display: flex;
        gap: 5px;
        align-items: center;
    }

    .barber-details .status {
        font-weight: bold;
    }

    .barber-details .status.open {
        color: #28a745;
    }

    .barber-details .distance {
        font-weight: bold;
    }
    .marker-container {
      position: relative;
      width: 60px;
      height: 80px;
    }

    .marker {
      position: absolute;
      width: 44px;
      height: 44px;
      background-color: #2d7a5d;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .marker-inner {
      width: 34px;
      height: 34px;
      background-color: white;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .marker::after {
      content: '';
      position: absolute;
      bottom: -7px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-top: 11px solid #2d7a5d;
      z-index: -1;
    }

    .time {
      font-size: 14px;
      font-weight: bold;
      margin: 0;
      color: #2d7a5d;
    }

    .unit {
      font-size: 10px;
      margin: -2px 0 0 0;
      color: #2d7a5d;
    }
      .location-marker {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .center-dot {
      width: 12px;
      height: 12px;
      background-color: #4285f4;
      border-radius: 50%;
      position: absolute;
      z-index: 2;
      box-shadow: 0 0 0 1px white;
    }

    .pulse {
      position: absolute;
      width: 24px;
      height: 24px;
      background-color: rgba(66, 133, 244, 0.2);
      border-radius: 50%;
      animation: pulse 2s ease-out infinite;
    }

    .outer-circle {
      position: absolute;
      width: 24px;
      height: 24px;
      background-color: rgba(66, 133, 244, 0.1);
      border-radius: 50%;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }

`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

initMap() // async function
