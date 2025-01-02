/* static/js/map.js */
let map;
let markers = [];
let userMarker;
let infoWindow;

const DEFAULT_RADIUS = 10; //miles

function initMap() {
    // Initialize map with default center
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 0, lng: 0 },
        styles: [
            {
                "featureType": "poi.business",
                "elementType": "labels",
                "stylers": [{ "visibility": "off" }]
            }
        ]
    });

    infoWindow = new google.maps.InfoWindow();

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                const userLat = position.coords.latitude
                const userLng = position.coords.longitude
                // debug
                console.log("Latitude: " + userLat)
                console.log("Longitude:" + userLng)

                map.setCenter(pos);
                
                // Add a marker for user's location
                new google.maps.Marker({
                    position: pos,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF"
                    },
                    title: "Your Location"
                });

                // Load active barbers
                loadNearbyBarbers(userLat, userLng);
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function loadNearbyBarbers(latitude, longitude) {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    // Fetch nearby barbers
    fetch(`/get-nearby-barbers?lat=${latitude}&lng=${longitude}&radius=${DEFAULT_RADIUS}`)
        .then(response => response.json())
        .then(barbers => {
            const barberList = document.getElementById('barber-list');
            barberList.innerHTML = barbers.length ? '' : '<div class="no-results">No barbers found nearby</div>';
            
            // Create markers and list items for each barber
            barbers.forEach(barber => {
                // Create marker
                const marker = new google.maps.Marker({
                    position: { lat: barber.latitude, lng: barber.longitude },
                    map: map,
                    title: barber.name,
                    animation: google.maps.Animation.DROP
                });

                // Create info window content
                const content = `
                    <div class="info-window">
                        <h3>${barber.name}</h3>
                        <p>${barber.address}</p>
                        <p>Wait time: ${barber.wait_time} customers</p>
                        <p>Distance: ${barber.distance} miles</p>
                        <button class="btn btn-primary btn-sm" onclick="openWaitlistModal(${barber.id})">
                            Join Waitlist
                        </button>
                    </div>
                `;

                // Add click listener to marker
                marker.addListener('click', () => {
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                });

                markers.push(marker);

                // Create list item
                const barberItem = document.createElement('div');
                barberItem.className = 'barber-item';
                barberItem.innerHTML = `
                    <h3>
                        ${barber.name}
                        <span class="distance-badge">${barber.distance} mi</span>
                    </h3>
                    <p>${barber.address}</p>
                    <div class="wait-time">
                        Wait time: ${barber.wait_time} customers
                    </div>
                    <button class="btn btn-primary mt-2" onclick="openWaitlistModal(${barber.id})">
                        Join Waitlist
                    </button>
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

            // Fit map bounds to include all markers and user location
            const bounds = new google.maps.LatLngBounds();
            markers.forEach(marker => bounds.extend(marker.getPosition()));
            if (userMarker) bounds.extend(userMarker.getPosition());
            if (markers.length > 0) map.fitBounds(bounds);
        });
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
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

document.addEventListener('DOMContentLoaded', initMap); // not sure about this