/* static/js/map.js */
let map;
let markers = [];
let infoWindow;

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
                loadActiveBarbers();
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function loadActiveBarbers() {
    fetch('/find-barbers')
        .then(response => response.json())
        .then(barbers => {
            // Clear existing markers
            markers.forEach(marker => marker.setMap(null));
            markers = [];
            
            // Clear barber list
            const barberList = document.getElementById('barber-list');
            barberList.innerHTML = '';
            
            barbers.forEach(barber => {
                const position = {
                    lat: barber.latitude,
                    lng: barber.longitude
                };

                // Create marker
                const marker = new google.maps.Marker({
                    position: position,
                    map: map,
                    title: barber.name,
                    animation: google.maps.Animation.DROP
                });

                // Create info window content
                const content = `
                    <div class="info-window">
                        <h3>${barber.name}</h3>
                        <p>Wait time: ${barber.wait_time} customers</p>
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
                
                // Add to sidebar list
                const barberItem = document.createElement('div');
                barberItem.className = 'barber-item';
                barberItem.innerHTML = `
                    <h3>${barber.name}</h3>
                    <p>Wait time: ${barber.wait_time} customers</p>
                    <button class="btn btn-primary" onclick="openWaitlistModal(${barber.id})">
                        Join Waitlist
                    </button>
                `;

                // Add click listener to list item
                barberItem.addEventListener('click', () => {
                    map.panTo(position);
                    map.setZoom(15);
                    infoWindow.setContent(content);
                    infoWindow.open(map, marker);
                });

                barberList.appendChild(barberItem);
            });
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