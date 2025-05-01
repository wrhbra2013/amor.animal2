/* funçao foto */
function preview() {
    frame.src=URL.createObjectURL(event.target.files[0]);
  };

     // Script do preview da imagem (ajustado para placeholder)
     const frame = document.getElementById('frame');
     const fileInput = document.getElementById('arquivo');
     const previewPlaceholder = document.getElementById('preview-placeholder'); // Get placeholder element
 
     function previewImage(event) {
         if (event.target.files && event.target.files[0]) {
             const reader = new FileReader();
             reader.onload = function(e) {
                 frame.src = e.target.result;
                 frame.style.display = 'block'; // Show image
                 frame.alt = `Pré-visualização de ${event.target.files[0].name}`;
                 if (previewPlaceholder) {
                     previewPlaceholder.style.display = 'none'; // Hide placeholder
                 }
             }
             reader.readAsDataURL(event.target.files[0]);
         } else {
             clearImagePreview(); // Clear if no file selected
         }
     }
 
     function clearImagePreview() {
         frame.src = '';
         frame.style.display = 'none'; // Hide image
         frame.alt = 'Pré-visualização da foto do pet';
         if (previewPlaceholder) {
             previewPlaceholder.style.display = 'block'; // Show placeholder
         }
         if (fileInput) {
             try {
                 fileInput.value = null;
             } catch(err) {
                 console.log("Error resetting file input: ", err);
             }
         }
     }
 
     // Reset form and preview on page show (e.g., back button)
     window.addEventListener('pageshow', function(event) {
         if (event.persisted) {
             const form = document.getElementById('form-procura-se');
             if (form) {
                 form.reset();
             }
             clearImagePreview();
         }
     });
 
      // Initial state setup on load
      document.addEventListener('DOMContentLoaded', () => {
         clearImagePreview(); // Ensure initial state is correct
     });