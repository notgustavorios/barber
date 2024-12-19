let map;
let markers = [];

function initMap() {
    // Initialize map centered on user's location
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            map = L.map('map').setView([latitude, longitude], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Load active barbers
            loadActiveBarbers();
        },
        error => {
            console.error('Error getting location:', error);
            // Default to a central location if geolocation fails
            map = L.map('map').setView([0, 0], 13);
            loadActiveBarbers();
        }
    );
}

function loadActiveBarbers() {
    fetch('/find-barbers')
        .then(response => response.json())
        .then(barbers => {
            // Clear existing markers
            markers.forEach(marker => marker.remove());
            markers = [];
            
            // Clear barber list
            const barberList = document.getElementById('barber-list');
            barberList.innerHTML = '';
            
            barbers.forEach(barber => {
                // Add marker to map
                const marker = L.marker([barber.latitude, barber.longitude])
                    .bindPopup(`
                        <strong>${barber.name}</strong><br>
                        Wait time: ${barber.wait_time} customers<br>
                        <button onclick="openWaitlistModal(${barber.id})">Join Waitlist</button>
                    `)
                    .addTo(map);
                markers.push(marker);
                
                // Add to sidebar list
                const barberItem = document.createElement('div');
                barberItem.className = 'barber-item';
                barberItem.innerHTML = `
                    <h3>${barber.name}</h3>
                    <p>Wait time: ${barber.wait_time} customers</p>
                    <button onclick="openWaitlistModal(${barber.id})">Join Waitlist</button>
                `;
                barberList.appendChild(barberItem);
            });
        });
}

function openWaitlistModal(barberId) {
    const modal = document.getElementById('waitlist-modal');
    const form = document.getElementById('waitlist-form');
    form.action = `/join-waitlist/${barberId}`;
    modal.style.display = 'block';
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', initMap);