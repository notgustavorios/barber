document.addEventListener('DOMContentLoaded', function() {
    console.log("Barber registration js loaded")

    // Form validation
    const form = document.getElementById('registerForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm_password');
    const passwordError = document.getElementById('password-error');

    form.addEventListener('submit', function(event) {
        // Reset error messages
        passwordError.textContent = '';

        // Validate password length
        if (password.value.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters long';
            event.preventDefault();
            return;
        }

        // Validate password match
        if (password.value !== confirmPassword.value) {
            passwordError.textContent = 'Passwords do not match';
            event.preventDefault();
            return;
        }

        // Validate that address coordinates were captured
        if (!document.getElementById('latitude').value || 
            !document.getElementById('longitude').value) {
            alert('Please select a valid address from the dropdown suggestions');
            event.preventDefault();
            return;
        }
    });
});

let autocomplete;
function initAutocomplete() 
{
    console.log("initAutocomplete() ran")
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('address'),
        {
            types: ['establishment'],
            componentRestrictions: {'country': ['US']},
            fields: ['place_id', 'geometry', 'name']
        }
    );
    autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged()
{
    const place = autocomplete.getPlace();
    if (!place.geometry) {
        alert('Please select a valid address from the dropdown.');
        return;
    }

    document.getElementById('latitude').value = place.geometry.location.lat();
    document.getElementById('longitude').value = place.geometry.location.lng();
    
}