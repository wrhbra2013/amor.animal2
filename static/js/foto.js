const frame = document.getElementById('frame');
const placeholder = document.getElementById('preview-placeholder');
const fileInput = document.getElementById('arquivo');

function preview() {
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            frame.src = e.target.result;
            frame.style.display = 'block'; // Show the image
            placeholder.style.display = 'none'; // Hide the placeholder
        }

        reader.readAsDataURL(fileInput.files[0]); // Read the file as a Data URL
    } else {
        // Optional: Handle case where no file is selected after trying
        clearPreview();
    }
}

function clearPreview() {
    frame.src = ''; // Clear the image source
    frame.style.display = 'none'; // Hide the image
    placeholder.style.display = 'block'; // Show the placeholder
    // Note: The type="reset" on the button will clear the file input itself
    // If you didn't use type="reset", you'd need: fileInput.value = null;
}

// Optional: Add event listener to the form's reset event for robustness
const form = document.getElementById('form-procura-se');
if (form) {
    form.addEventListener('reset', clearPreview);
}
preview()
clearPreview()