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
        mapId: "ba8effea0c7c0798"
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

                new AdvancedMarkerElement({
                    map: map,
                    position: {
                        lat: userLat,
                        lng: userLng
                    }
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

                const waitTime = document.createElement("div");
                waitTime.className = "wait-list-tag"
                waitTime.textContent = "17 min."

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
    .wait-list-tag {
        background-color: #4285F4;
        border-radius: 8px;
        color: #FFFFFF;
        font-size: 14px;
        padding: 10px 15px;
        position: relative;
    }

    .wait-list-tag::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 100%;
        transform: translate(-50%, 0);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #4285F4;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

initMap() // async function
