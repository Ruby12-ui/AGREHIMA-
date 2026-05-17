# ═══════════════════════════════════════════════════
# app.py — Servidor principal de Granadas Frescas
# Framework: Flask (Python)
# Base de datos: MySQL (conector: mysql-connector-python)
# ═══════════════════════════════════════════════════

from flask import Flask, render_template, request, redirect, url_for, session
import logging
import mysql.connector


# ──────────────────────────────────────
# CONFIGURACIÓN INICIAL DE FLASK
# Indica dónde están los templates HTML
# y define la clave secreta para sesiones
# ──────────────────────────────────────
app = Flask(__name__, template_folder='template')
app.secret_key = 'clave_secreta_para_granadas_frescas_123'

# Solo mostrar errores graves en la consola
logging.basicConfig(level=logging.ERROR)


# ──────────────────────────────────────
# CONEXIÓN A BASE DE DATOS
# Función reutilizable que abre una
# conexión nueva a MySQL cada vez
# que se necesita guardar o leer datos
# ──────────────────────────────────────
def get_connection():
    return mysql.connector.connect(
        host='localhost',
        port=3307,
        user='root',
        password='Ruby120',
        database='AGREHIMA'
    )


# ──────────────────────────────────────
# RUTAS SIMPLES (solo muestran HTML)
# Estas páginas no necesitan datos de
# la base de datos, solo renderizan
# su template correspondiente
# ──────────────────────────────────────

@app.route('/')
def index():
    # Página de inicio
    return render_template('index.html')

@app.route('/productos.html')
def productos():
    # Página de productos
    return render_template('productos.html')

@app.route('/beneficios.html')
def beneficios():
    # Página de beneficios de la granada
    return render_template('beneficios.html')

@app.route('/nosotros.html')
def nosotros():
    # Página "Quiénes somos"
    return render_template('nosotros.html')

@app.route('/galeria.html')
def galeria():
    # Página de galería de fotos
    return render_template('galeria.html')


# ──────────────────────────────────────
# RUTA: RESERVA DE VISITAS AL HUERTO
# GET  → muestra el formulario vacío
# POST → recibe los datos del formulario,
#        los valida y los guarda en MySQL
# ──────────────────────────────────────
@app.route('/visitas.html', methods=['GET', 'POST'])
def visitas():
    mensaje = ''

    if request.method == 'POST':
        # Obtener y limpiar los datos enviados por el formulario
        nombre            = request.form.get('nombre', '').strip()
        email             = request.form.get('email', '').strip()
        telefono          = request.form.get('telefono', '').strip()
        fecha_visita      = request.form.get('fecha_visita', '').strip()
        cantidad_personas = request.form.get('cantidad_personas', '').strip()
        interes_compra    = request.form.get('interes_compra', '').strip()

        # Validar que todos los campos estén completos
        if not all([nombre, email, telefono, fecha_visita, cantidad_personas, interes_compra]):
            mensaje = 'Todos los campos son obligatorios.'
        else:
            conexion = None
            cursor   = None
            try:
                # Conectar a la base de datos e insertar la reserva
                conexion = get_connection()
                cursor   = conexion.cursor()

                sql = """
                    INSERT INTO visitas 
                    (nombre, email, telefono, fecha_visita, cantidad_personas, interes_compra) 
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                valores = (nombre, email, telefono, fecha_visita, cantidad_personas, interes_compra)
                cursor.execute(sql, valores)
                conexion.commit()  # Confirmar los cambios en la base de datos

                mensaje = '¡Tu reserva de visita ha sido registrada con éxito! Te esperamos.'

            except Exception as e:
                # Si falla la base de datos, registrar el error y avisar al usuario
                logging.error(f'Error al guardar visita: {e}')
                mensaje = 'Ocurrió un error al procesar tu reserva.'

            finally:
                # Siempre cerrar cursor y conexión, haya error o no
                if cursor   is not None: cursor.close()
                if conexion is not None and conexion.is_connected(): conexion.close()

    return render_template('visitas.html', mensaje=mensaje)


# ──────────────────────────────────────
# RUTA: GRANADA CHAT (con contraseña)
# GET  → muestra el formulario de login
#        o el chat si ya está autenticado
# POST → valida la contraseña ingresada
#        y guarda la sesión si es correcta
# ──────────────────────────────────────
@app.route('/granada-chat.html', methods=['GET', 'POST'])
def chat():
    error = None

    if request.method == 'POST':
        password_ingresada = request.form.get('api_key', '').strip()

        # Verificar si la contraseña es correcta
        if password_ingresada == 'granada':
            session['chat_autenticado'] = True   # Guardar sesión activa
            return redirect(url_for('chat'))      # Redirigir al chat ya autenticado
        else:
            error = "Contraseña incorrecta. Inténtalo de nuevo."

    # Si ya tiene sesión activa, mostrar el chat directamente
    if session.get('chat_autenticado'):
        return render_template('granada-chat.html', autenticado=True)

    # Si no está autenticado, mostrar el formulario de contraseña
    return render_template('granada-chat.html', autenticado=False, error=error)


# ──────────────────────────────────────
# RUTA: CERRAR SESIÓN DEL CHAT
# Elimina la sesión del chat y redirige
# al formulario de contraseña
# ──────────────────────────────────────
@app.route('/chat/salir')
def salir_chat():
    session.pop('chat_autenticado', None)  # Borrar sesión
    return redirect(url_for('chat'))


# ──────────────────────────────────────
# PUNTO DE ENTRADA
# Ejecuta el servidor en modo debug
# solo cuando se corre directamente
# con: python app.py
# ──────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True)