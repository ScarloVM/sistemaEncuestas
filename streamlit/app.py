import os
import streamlit as st
import pandas as pd
from pymongo import MongoClient

# Obtener los valores de las variables de entorno
# Obtener las variables de entorno para la conexión a MongoDB
mongo_url = os.getenv("MONGO_URL", "mongodb://mongo:27017")
mongo_db_name = os.getenv("MONGO_NAME", "sistemaEncuestas")
mongo_user = os.getenv("MONGO_USER", "root")
mongo_password = os.getenv("MONGO_PASSWORD", "example")

# Construir la URI de conexión con credenciales
mongo_uri = "mongodb://root:example@mongo/admin"

# Conexión a MongoDB utilizando las variables de entorno
client = MongoClient(mongo_uri)
db = client[mongo_db_name]  # Nombre de tu base de datos
collection = db['encuestas']  # Nombre de tu colección
st.title("Dashboard Visualizacion de Datos") # Título de la app

# Encuentra el documento con idEncuesta 1
# Encuentra el documento con idEncuesta 1
data = collection.find_one({'idEncuesta': 1})

# Función para procesar las respuestas
def procesar_respuestas(encuesta_data):
    respuestas_procesadas = {}
    for pregunta in encuesta_data['questions']:
        id_pregunta = pregunta['idPregunta']
        tipo = pregunta['tipo']
        texto = pregunta['texto']
        
        if tipo == "abierta":
            respuestas_procesadas[id_pregunta] = []
        elif tipo == "numerica":
            respuestas_procesadas[id_pregunta] = []
        else:
            respuestas_procesadas[id_pregunta] = {op: 0 for op in pregunta.get('options', [])}
    
    for respuesta in encuesta_data['respuestas']:
        for r in respuesta['respuesta']:
            id_pregunta = r['idPregunta']
            tipo = r['tipo']
            if tipo == "abierta":
                respuestas_procesadas[id_pregunta].append(r['respuesta'])
            elif tipo == "eleccion_simple" or tipo == "Si/No":
                respuestas_procesadas[id_pregunta][r['option_seleccionada']] += 1
            elif tipo == "eleccion_multiple":
                for op in r['option_seleccionada']:
                    respuestas_procesadas[id_pregunta][op] += 1
            elif tipo == "escala_calificacion":
                respuestas_procesadas[id_pregunta][r['option_seleccionada']] += 1
            elif tipo == "numerica":
                respuestas_procesadas[id_pregunta].append(int(r['respuesta']))
    
    return respuestas_procesadas

# Procesar respuestas
def crear_graficos(doc):
    respuestas_procesadas = procesar_respuestas(doc)

    # Mostrar las estadísticas
    st.header(doc["titulo"])
    st.write(doc["descripcion"])

    for pregunta in doc['questions']:
        st.header(pregunta['texto'])
        id_pregunta = pregunta['idPregunta']
        tipo = pregunta['tipo']
        
        if tipo == "abierta":
            st.write("Respuestas de texto:")
            for respuesta in respuestas_procesadas[id_pregunta]:
                st.write(f"- {respuesta}")
        
        elif tipo in ["eleccion_simple", "eleccion_multiple", "Si/No", "escala_calificacion"]:
            st.write("Distribución de respuestas:")
            df = pd.DataFrame(list(respuestas_procesadas[id_pregunta].items()), columns=['Opción', 'Frecuencia'])
            st.bar_chart(df.set_index('Opción'))
        
        elif tipo == "numerica":
            st.write("Estadísticas numéricas:")
            df = pd.DataFrame(respuestas_procesadas[id_pregunta], columns=['Valor'])
            st.write(df.describe())

# Crear gráficos
crear_graficos(data)