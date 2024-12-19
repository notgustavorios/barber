document.addEventListener('DOMContentLoaded', () => {
    const statusButton = document.getElementById('toggle-status');
    
    statusButton.addEventListener('click', () => {
        // Get current location before toggling status
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                
                fetch('/barber/toggle-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `latitude=${latitude}&longitude=${longitude}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        if (data.is_active) {
                            statusButton.textContent = 'Clock Out';
                            statusButton.classList.remove('btn-success');
                            statusButton.classList.add('btn-danger');
                        } else {
                            statusButton.textContent = 'Clock In';
                            statusButton.classList.remove('btn-danger');
                            statusButton.classList.add('btn-success');
                        }
                    }
                });
            },
            error => {
                console.error('Error getting location:', error);
                alert('Unable to get location. Please enable location services.');
            }
        );
    });
    
    // Handle completing customers
    document.querySelectorAll('.complete-customer').forEach(button => {
        button.addEventListener('click', () => {
            const customerId = button.dataset.id;
            fetch(`/complete-customer/${customerId}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    button.closest('.waitlist-item').remove();
                }
            });
        });
    });
});