import cv2
import numpy as np
from PIL import Image

def aplicar_otsu(input_path, output_path):
    try:
        print(f"Leyendo imagen desde: {input_path}")
        img = cv2.imread(input_path)
        
        if img is None:
            print(f"ERROR: No se pudo cargar la imagen desde {input_path}")
            return False
        
        print(f"Imagen cargada correctamente, dimensiones: {img.shape}")
        
        # Convertir a escala de grises si no lo está
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            print("Imagen convertida a escala de grises")
        else:
            gray = img
            print("La imagen ya está en escala de grises")
        
        # Aplicar el algoritmo de Otsu
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        print(f"Algoritmo de Otsu aplicado, umbral seleccionado")
        
        # Guardar la imagen procesada
        result = cv2.imwrite(output_path, binary)
        if result:
            print(f"Imagen procesada guardada exitosamente en: {output_path}")
        else:
            print(f"ERROR: No se pudo guardar la imagen en {output_path}")
        
        return result
    
    except Exception as e:
        print(f"ERROR en aplicar_otsu: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def umbral_otsu_manual(imagen_gris):
    """
    Implementación manual del algoritmo de Otsu
    (Solo para fines educativos, la función aplicar_otsu usa la implementación de OpenCV)
    
    Args:
        imagen_gris (numpy.ndarray): Imagen en escala de grises
    
    Returns:
        int: Valor del umbral óptimo
    """
    # Calcular el histograma
    histograma = cv2.calcHist([imagen_gris], [0], None, [256], [0, 256])
    histograma = histograma.reshape(-1)
    
    # Normalizar el histograma
    histograma_normalizado = histograma / histograma.sum()
    
    # Inicializar variables
    umbral_optimo = 0
    varianza_maxima = 0
    
    # Calcular la media total
    media_total = sum([i * histograma_normalizado[i] for i in range(256)])
    
    # Probabilidades acumuladas
    w0 = 0
    
    for t in range(256):
        # Clase 1 (fondo)
        w0 += histograma_normalizado[t]
        if w0 == 0:
            continue
        
        # Clase 2 (objeto)
        w1 = 1 - w0
        if w1 == 0:
            break
        
        # Calcular medias de clases
        media0 = sum([i * histograma_normalizado[i] for i in range(t+1)]) / w0
        media1 = (media_total - w0 * media0) / w1
        
        # Calcular varianza entre clases
        varianza = w0 * w1 * ((media0 - media1) ** 2)
        
        # Actualizar umbral si la varianza es mayor
        if varianza > varianza_maxima:
            varianza_maxima = varianza
            umbral_optimo = t
    
    return umbral_optimo