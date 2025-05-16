// Implementación del algoritmo de Otsu en el cliente con JavaScript

/**
 * Aplica el algoritmo de Otsu a una imagen en el cliente
 * @param {HTMLImageElement} inputImage - La imagen a procesar
 * @param {function} callback - Función de callback que recibe el resultado como URL de datos
 */
function aplicarOtsuCliente(inputImage, callback) {
    console.log("Aplicando Otsu en el cliente...");
    
    try {
        // Crear un canvas para procesar la imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Verificar dimensiones de la imagen
        console.log("Dimensiones de la imagen:", inputImage.naturalWidth, "x", inputImage.naturalHeight);
        
        // Establecer dimensiones del canvas al tamaño de la imagen
        canvas.width = inputImage.naturalWidth;
        canvas.height = inputImage.naturalHeight;
        
        // Dibujar la imagen en el canvas
        ctx.drawImage(inputImage, 0, 0);
        
        // Obtener datos de píxeles
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        console.log("Datos de imagen obtenidos, longitud:", data.length);
        
        // Convertir a escala de grises
        const grayData = new Uint8Array(canvas.width * canvas.height);
        for (let i = 0, j = 0; i < data.length; i += 4, j++) {
            // Fórmula para convertir RGB a escala de grises
            grayData[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }
        
        console.log("Imagen convertida a escala de grises");
        
        // Calcular histograma
        const histogram = new Array(256).fill(0);
        for (let i = 0; i < grayData.length; i++) {
            histogram[grayData[i]]++;
        }
        
        console.log("Histograma calculado");
        
        // Calcular el umbral óptimo usando el algoritmo de Otsu
        const threshold = calcularUmbralOtsu(histogram, grayData.length);
        console.log("Umbral calculado:", threshold);
        
        // Aplicar umbralización
        for (let i = 0, j = 0; i < data.length; i += 4, j++) {
            const valor = grayData[j] > threshold ? 255 : 0;
            data[i] = valor;     // R
            data[i + 1] = valor; // G
            data[i + 2] = valor; // B
            // Mantener el alfa original
        }
        
        console.log("Umbralización aplicada");
        
        // Poner los datos procesados de vuelta en el canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Convertir canvas a URL de datos (data URL)
        const dataURL = canvas.toDataURL('image/png');
        console.log("Imagen convertida a URL de datos");
        
        // Llamar al callback con el resultado
        callback(dataURL);
    } catch (error) {
        console.error("Error al aplicar Otsu:", error);
        alert("Error al procesar la imagen: " + error.message);
    }
}

/**
 * Calcula el umbral óptimo usando el algoritmo de Otsu
 * @param {Array} histogram - Histograma de la imagen (256 valores)
 * @param {number} total - Número total de píxeles
 * @returns {number} - El umbral óptimo
 */
function calcularUmbralOtsu(histogram, total) {
    let sum = 0;
    for (let i = 0; i < 256; i++) {
        sum += i * histogram[i];
    }
    
    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVariance = 0;
    let threshold = 0;
    
    for (let t = 0; t < 256; t++) {
        wB += histogram[t];               // Peso del fondo
        if (wB === 0) continue;
        
        wF = total - wB;                  // Peso del primer plano
        if (wF === 0) break;
        
        sumB += t * histogram[t];
        
        const mB = sumB / wB;             // Media del fondo
        const mF = (sum - sumB) / wF;     // Media del primer plano
        
        // Calcular varianza entre clases
        const varianza = wB * wF * Math.pow(mB - mF, 2);
        
        // Actualizar umbral si encontramos una varianza mayor
        if (varianza > maxVariance) {
            maxVariance = varianza;
            threshold = t;
        }
    }
    
    return threshold;
}

// Función principal para procesar una imagen
function procesarImagenCliente(file, callback) {
    console.log("Procesando imagen cliente:", file.name);
    
    try {
        // Crear un objeto URL para la imagen seleccionada
        const fileURL = URL.createObjectURL(file);
        const img = new Image();
        
        img.onload = function() {
            console.log("Imagen cargada correctamente, aplicando Otsu");
            
            // Aplicar Otsu a la imagen cargada
            aplicarOtsuCliente(img, function(dataURL) {
                console.log("Otsu aplicado correctamente, convirtiendo a Blob");
                
                // Convertir data URL a Blob
                fetch(dataURL)
                    .then(res => res.blob())
                    .then(blob => {
                        // Liberar el objeto URL creado
                        URL.revokeObjectURL(fileURL);
                        
                        console.log("Procesamiento completado con éxito");
                        
                        // Llamar al callback con el blob resultante
                        callback(blob);
                    })
                    .catch(error => {
                        console.error("Error al convertir dataURL a Blob:", error);
                        alert("Error en el procesamiento: " + error.message);
                    });
            });
        };
        
        img.onerror = function(error) {
            console.error("Error al cargar la imagen:", error);
            URL.revokeObjectURL(fileURL);
            alert("Error al cargar la imagen. Por favor, intente con otra imagen.");
        };
        
        // Comenzar a cargar la imagen
        console.log("Iniciando carga de imagen desde URL:", fileURL);
        img.src = fileURL;
        
    } catch (error) {
        console.error("Error en procesarImagenCliente:", error);
        alert("Error al procesar la imagen: " + error.message);
    }
}

// Inicialización simple para procesar cuando se selecciona un archivo
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando procesamiento en cliente...");
    
    // Buscar elementos relevantes
    const clientProcessingOption = document.getElementById('clientProcessing');
    if (!clientProcessingOption) {
        console.log("Opción de procesamiento en cliente no encontrada, posiblemente estamos en otra página");
        return;
    }
    
    console.log("Opción de procesamiento en cliente encontrada");
    
    // Verificar o crear la sección de procesamiento en cliente
    let clientProcessingSection = document.getElementById('clientProcessingSection');
    if (!clientProcessingSection) {
        console.log("Sección de procesamiento en cliente no encontrada, creando una nueva");
        clientProcessingSection = document.createElement('div');
        clientProcessingSection.id = 'clientProcessingSection';
        clientProcessingSection.className = 'mb-4';
        clientProcessingSection.style.display = 'none';
        
        // Insertar después de la sección de subida de imagen
        const clientImageSection = document.getElementById('clientImageSection');
        if (clientImageSection) {
            clientImageSection.after(clientProcessingSection);
            
            // Crear alerta informativa
            const alertInfo = document.createElement('div');
            alertInfo.className = 'alert alert-info';
            alertInfo.innerHTML = '<strong>Procesamiento en Cliente:</strong> La imagen será procesada directamente en tu navegador utilizando JavaScript.';
            clientProcessingSection.appendChild(alertInfo);
        } else {
            console.error("No se encontró la sección de imagen de cliente para insertar después");
            return;
        }
    }
    
    // Verificar o crear el contenedor de vista previa
    let previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) {
        console.log("Contenedor de vista previa no encontrado, creando uno nuevo");
        previewContainer = document.createElement('div');
        previewContainer.id = 'previewContainer';
        previewContainer.className = 'row mb-3';
        clientProcessingSection.appendChild(previewContainer);
    }
    
    // Verificar o crear el botón de envío
    let clientSubmitBtn = document.getElementById('clientSubmitBtn');
    if (!clientSubmitBtn) {
        console.log("Botón de envío no encontrado, creando uno nuevo");
        clientSubmitBtn = document.createElement('button');
        clientSubmitBtn.id = 'clientSubmitBtn';
        clientSubmitBtn.className = 'btn btn-success mt-3';
        clientSubmitBtn.textContent = 'Enviar imagen procesada al servidor';
        clientSubmitBtn.disabled = true;
        clientProcessingSection.appendChild(clientSubmitBtn);
    }
    
    // Buscar el input de archivo
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput) {
        console.error("Input de archivo no encontrado");
        return;
    }
    
    // Ocultar botón regular cuando se selecciona procesamiento en cliente
    const regularSubmitBtn = document.getElementById('regularSubmitBtn');
    
    // Función para manejar el cambio de archivo
    function handleFileChange() {
        const file = fileInput.files[0];
        if (!file) {
            console.log("No hay archivo seleccionado");
            return;
        }
        
        console.log("Archivo seleccionado:", file.name);
        
        // Verificar si la opción de procesamiento en cliente está seleccionada
        if (!clientProcessingOption.checked) {
            console.log("Procesamiento en cliente no seleccionado, ignorando");
            return;
        }
        
        // Mostrar la sección de procesamiento en cliente
        clientProcessingSection.style.display = 'block';
        if (regularSubmitBtn) regularSubmitBtn.style.display = 'none';
        
        // Limpiar contenedor de vista previa
        previewContainer.innerHTML = '';
        
        // Crear elementos para vista previa
        const row = document.createElement('div');
        row.className = 'row';
        
        // Columna para imagen original
        const colOriginal = document.createElement('div');
        colOriginal.className = 'col-md-6';
        
        // Columna para imagen procesada
        const colProcessed = document.createElement('div');
        colProcessed.className = 'col-md-6';
        
        // Crear cards para las imágenes
        const cardOriginal = createCard('Imagen Original');
        const cardProcessed = createCard('Imagen Procesada con Otsu');
        
        // Crear imágenes
        const imgOriginal = document.createElement('img');
        imgOriginal.className = 'img-fluid';
        imgOriginal.style.maxHeight = '300px';
        
        const imgProcessed = document.createElement('img');
        imgProcessed.className = 'img-fluid';
        imgProcessed.style.maxHeight = '300px';
        
        // Añadir imágenes a las cards
        cardOriginal.querySelector('.card-body').appendChild(imgOriginal);
        cardProcessed.querySelector('.card-body').appendChild(imgProcessed);
        
        // Añadir cards a las columnas
        colOriginal.appendChild(cardOriginal);
        colProcessed.appendChild(cardProcessed);
        
        // Añadir columnas a la fila
        row.appendChild(colOriginal);
        row.appendChild(colProcessed);
        
        // Añadir fila al contenedor
        previewContainer.appendChild(row);
        
        // Crear spinners
        const spinnerOriginal = createSpinner();
        const spinnerProcessed = createSpinner();
        
        cardOriginal.querySelector('.card-body').appendChild(spinnerOriginal);
        cardProcessed.querySelector('.card-body').appendChild(spinnerProcessed);
        
        // Deshabilitar botón de envío mientras se procesa
        clientSubmitBtn.disabled = true;
        clientSubmitBtn.textContent = 'Procesando imagen...';
        
        try {
            // Mostrar imagen original
            const fileURL = URL.createObjectURL(file);
            console.log("URL creada para vista previa:", fileURL);
            
            imgOriginal.onload = function() {
                console.log("Imagen original cargada en vista previa");
                
                // Quitar spinner de imagen original
                spinnerOriginal.remove();
                
                // Procesar imagen
                console.log("Iniciando procesamiento de imagen");
                procesarImagenCliente(file, function(processedBlob) {
                    console.log("Imagen procesada recibida, creando URL para vista previa");
                    
                    // Mostrar imagen procesada
                    const processedURL = URL.createObjectURL(processedBlob);
                    imgProcessed.src = processedURL;
                    
                    imgProcessed.onload = function() {
                        console.log("Imagen procesada cargada en vista previa");
                        
                        // Quitar spinner de imagen procesada
                        spinnerProcessed.remove();
                        
                        // Guardar blob para envío
                        window.processedImageBlob = processedBlob;
                        
                        // Habilitar botón de envío
                        clientSubmitBtn.disabled = false;
                        clientSubmitBtn.textContent = 'Enviar imagen procesada al servidor';
                        
                        console.log("Procesamiento completado, botón habilitado");
                    };
                    
                    imgProcessed.onerror = function(error) {
                        console.error("Error al cargar imagen procesada en vista previa:", error);
                        spinnerProcessed.remove();
                        alert("Error al mostrar la imagen procesada");
                    };
                });
            };
            
            imgOriginal.onerror = function(error) {
                console.error("Error al cargar imagen original en vista previa:", error);
                spinnerOriginal.remove();
                alert("Error al mostrar la imagen original");
            };
            
            imgOriginal.src = fileURL;
            
        } catch (error) {
            console.error("Error en handleFileChange:", error);
            alert("Error al procesar el archivo: " + error.message);
        }
    }
    
    // Función auxiliar para crear una card
    function createCard(title) {
        const card = document.createElement('div');
        card.className = 'card mb-4';
        
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        
        const cardTitle = document.createElement('h4');
        cardTitle.textContent = title;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body text-center';
        
        cardHeader.appendChild(cardTitle);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        
        return card;
    }
    
    // Función auxiliar para crear un spinner
    function createSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'spinner-border text-primary';
        spinner.role = 'status';
        
        const span = document.createElement('span');
        span.className = 'visually-hidden';
        span.textContent = 'Procesando...';
        
        spinner.appendChild(span);
        return spinner;
    }
    
    // Escuchar cambios en el archivo seleccionado
    fileInput.addEventListener('change', function(event) {
        console.log("Evento change en input de archivo detectado");
        handleFileChange();
    });
    
    // Escuchar cambios en la opción de procesamiento
    const processingOptions = document.getElementsByName('processingOption');
    processingOptions.forEach(option => {
        option.addEventListener('change', function() {
            console.log("Opción cambiada a:", this.value);
            
            // Actualizar valor del campo oculto
            const uploadOption = document.getElementById('uploadOption');
            if (uploadOption) uploadOption.value = this.value;
            
            if (this.value === 'client_processing') {
                // Mostrar sección
                clientProcessingSection.style.display = 'block';
                if (regularSubmitBtn) regularSubmitBtn.style.display = 'none';
                
                // Evitar envío normal del formulario
                const uploadForm = document.getElementById('uploadForm');
                if (uploadForm) {
                    uploadForm.onsubmit = function(e) {
                        if (clientProcessingOption.checked) {
                            e.preventDefault();
                            return false;
                        }
                        return true;
                    };
                }
                
                // Si hay archivo seleccionado, procesarlo
                if (fileInput.files.length > 0) {
                    console.log("Archivo ya seleccionado, procesando...");
                    handleFileChange();
                }
            } else {
                // Ocultar sección
                clientProcessingSection.style.display = 'none';
                if (regularSubmitBtn) regularSubmitBtn.style.display = 'block';
                
                // Restaurar comportamiento normal del formulario
                const uploadForm = document.getElementById('uploadForm');
                if (uploadForm) {
                    uploadForm.onsubmit = null;
                }
            }
        });
    });
    
    // Configurar el botón de envío
    clientSubmitBtn.addEventListener('click', function() {
        if (!window.processedImageBlob) {
            alert('Por favor, espere a que la imagen termine de procesarse.');
            return;
        }
        
        console.log("Enviando imagen procesada al servidor");
        this.disabled = true;
        this.textContent = 'Enviando...';
        
        // Crear FormData para enviar
        const formData = new FormData();
        formData.append('file', window.processedImageBlob, fileInput.files[0].name);
        formData.append('option', 'client_processing');
        formData.append('client_processed', 'true');
        
        // Enviar al servidor
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log("Respuesta del servidor recibida:", response);
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                return response.text().then(text => {
                    console.log("Respuesta del servidor:", text);
                    this.disabled = false;
                    this.textContent = 'Enviar imagen procesada al servidor';
                });
            }
        })
        .catch(error => {
            console.error("Error al enviar:", error);
            alert("Error al enviar la imagen: " + error.message);
            this.disabled = false;
            this.textContent = 'Enviar imagen procesada al servidor';
        });
    });
    
    // Si la opción de cliente ya está seleccionada y hay un archivo, procesarlo
    if (clientProcessingOption.checked && fileInput.files.length > 0) {
        console.log("Opción de cliente ya seleccionada con archivo, procesando...");
        clientProcessingSection.style.display = 'block';
        if (regularSubmitBtn) regularSubmitBtn.style.display = 'none';
        handleFileChange();
    }
    
    // Si estamos en la página de procesamiento de cliente
    const isClientProcessingPage = window.location.pathname.includes('client_processing');
    if (isClientProcessingPage) {
        console.log("Estamos en la página de procesamiento de cliente");
        
        const originalImage = document.getElementById('originalImage');
        const processButton = document.getElementById('processButton');
        
        if (originalImage && processButton) {
            processButton.addEventListener('click', function() {
                console.log("Botón de procesamiento clickeado");
                
                const processingStatus = document.getElementById('processingStatus');
                if (processingStatus) processingStatus.style.display = 'block';
                
                this.disabled = true;
                
                // Procesar imagen
                aplicarOtsuCliente(originalImage, function(dataURL) {
                    console.log("Imagen procesada");
                    
                    // Mostrar imagen procesada
                    const processedImage = document.getElementById('processedImage');
                    if (processedImage) {
                        processedImage.src = dataURL;
                        
                        // Guardar data URL para descarga
                        const downloadBtn = document.getElementById('downloadBtn');
                        if (downloadBtn) downloadBtn.href = dataURL;
                        
                        // Mostrar resultados
                        const resultContainer = document.getElementById('resultContainer');
                        if (resultContainer) resultContainer.style.display = 'block';
                        
                        // Ocultar estado de procesamiento
                        if (processingStatus) processingStatus.style.display = 'none';
                    }
                });
            });
        }
    }
});