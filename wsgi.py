
# Este archivo es necesario para PythonAnywhere
# Se encuentra en /var/www/tuusuario_pythonanywhere_com_wsgi.py

import sys
import os

# Añadir el directorio de la aplicación al path
path = '/home/GonzaR/SD04-02'
if path not in sys.path:
    sys.path.append(path)

# Asegurarse que se está usando la versión correcta de Python
# y que cualquier módulo requerido está disponible
## MODIFICA ESTO CON TU VERSIÓN ESPECÍFICA DE PYTHON EN PYTHONANYWHERE
## (Actualmente PythonAnywhere soporta Python 3.6 a 3.10)
PYTHON_ANYWHERE_PYTHON_PATH = '/usr/bin/python3.8'

# Importar la aplicación Flask como 'application' (esto es requerido por WSGI)
from app import app as application