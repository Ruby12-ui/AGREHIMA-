from flask import Flask, render_template, request, redirect, url_for, session
import logging
import mysql.connector

app = Flask(__name__, template_folder='template')
app.secret_key = 'clave_secreta_para_granadas_frescas_123'

logging.basicConfig(level=logging.ERROR)

def get_connection():
    return mysql.connector.connect(
        host='localhost',
        port=3307,
        user='root',
        password='Ruby120',
        database='AGREHIMA'
    )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/productos.html')
def productos():
    return render_template('productos.html')

@app.route('/beneficios.html')
def beneficios():
    return render_template('beneficios.html')

@app.route('/nosotros.html')
def nosotros():
    return render_template('nosotros.html')

@app.route('/galeria.html')
def galeria():
    return render_template('galeria.html')

# =====================================================
# NUEVA RUTA: RESERVA DE VISITAS AL HUERTO
# =====================================================
@app.route('/visitas.html', methods=['GET', 'POST'])
def visitas():
    mensaje = ''
    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        email = request.form.get('email', '').strip()
        telefono = request.form.get('telefono', '').strip()
        fecha_visita = request.form.get('fecha_visita', '').strip()
        cantidad_personas = request.form.get('cantidad_personas', '').strip()
        interes_compra = request.form.get('interes_compra', '').strip()

        if not all([nombre, email, telefono, fecha_visita, cantidad_personas, interes_compra]):
            mensaje = 'Todos los campos son obligatorios.'
        else:
            conexion = None
            cursor = None
            try:
                conexion = get_connection()
                cursor = conexion.cursor()
                
                sql = """
                    INSERT INTO visitas 
                    (nombre, email, telefono, fecha_visita, cantidad_personas, interes_compra) 
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                valores = (nombre, email, telefono, fecha_visita, cantidad_personas, interes_compra)
                cursor.execute(sql, valores)
                conexion.commit()
                
                mensaje = '¡Tu reserva de visita ha sido registrada con éxito! Te esperamos.'
            except Exception as e:
                logging.error(f'Error al guardar visita: {e}')
                mensaje = 'Ocurrió un error al procesar tu reserva.'
            finally:
                if cursor is not None: cursor.close()
                if conexion is not None and conexion.is_connected(): conexion.close()

    return render_template('visitas.html', mensaje=mensaje)

# =====================================================
# CHAT GRANADA (VALIDACIÓN CON CONTRASEÑA "granada")
# =====================================================
@app.route('/granada-chat.html', methods=['GET', 'POST'])
def chat():
    error = None
    if request.method == 'POST':
        password_ingresada = request.form.get('api_key', '').strip()
        if password_ingresada == 'granada':
            session['chat_autenticado'] = True
            return redirect(url_for('chat'))
        else:
            error = "Contraseña incorrecta. Inténtalo de nuevo."

    if session.get('chat_autenticado'):
        return render_template('granada-chat.html', autenticado=True)
        
    return render_template('granada-chat.html', autenticado=False, error=error)

@app.route('/chat/salir')
def salir_chat():
    session.pop('chat_autenticado', None)
    return redirect(url_for('chat'))


if __name__ == '__main__':
    app.run(debug=True)