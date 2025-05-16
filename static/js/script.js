// script.js - Funcionalidades JavaScript para la aplicación

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos DOM
    const processingOptions = document.querySelectorAll('input[name="processingOption"]');
    const uploadOptionField = document.getElementById('uploadOption');
    const serverImageOptionField = document.getElementById('serverImageOption');
    
    // Actualizar opciones según la selección del usuario
    processingOptions.forEach(option => {
        option.addEventListener('change', function() {
            const selectedOption = this.value;
            
            // Actualizar campos ocultos
            if (uploadOptionField) uploadOptionField.value = selectedOption;
            if (serverImageOptionField) serverImageOptionField.value = selectedOption;
            
            // Se podría agregar más lógica específica para cada opción aquí
            // Por ejemplo, mostrar/ocultar elementos o cambiar textos
        });
    });
    
    // Vista previa de la imagen seleccionada
    const fileInput = document.getElementById('formFile');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Si quisiéramos mostrar una vista previa, podríamos crear un elemento img aquí
                    // y establecer su src a e.target.result
                    console.log('Imagen seleccionada:', file.name);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Validación del formulario
    const uploadForm = document.querySelector('form[action*="upload_file"]');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(event) {
            const fileInput = this.querySelector('input[type="file"]');
            if (!fileInput.files.length) {
                event.preventDefault();
                alert('Por favor, selecciona una imagen para procesar.');
            }
        });
    }
});