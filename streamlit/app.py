import time
import streamlit as st
import pandas as pd
from pymongo import MongoClient
from pyspark.sql.types import StructType, StructField, StringType, ArrayType, IntegerType
from pyspark.sql.functions import explode, col, countDistinct

# Conexion a MongoDB
mongo_uri = "mongodb://root:example@mongo/admin"
client = MongoClient(mongo_uri)
db = client['sistemaEncuestas']
collection = db['encuestas']

# Crear sesion de Spark que se conecta al contenedor de Spark
from pyspark.sql import SparkSession
spark = SparkSession.builder \
    .appName("Streamlit_Analysis") \
    .master("spark://spark:7077") \
    .getOrCreate()

# Crear una estructura para el DataFrame de PySpark a partir de las encuestas desde MongoDB
schema = StructType([
    StructField("idEncuesta", IntegerType(), True),
    StructField("titulo", StringType(), True),
    StructField("descripcion", StringType(), True),
    StructField("emailCreador", StringType(), True),
    StructField("estado", StringType(), True),
    StructField("questions", ArrayType(StructType([
        StructField("idPregunta", IntegerType(), True),
        StructField("tipo", StringType(), True),  
        StructField("texto", StringType(), True),
        StructField("options", ArrayType(StringType()), True)
    ])), True),
    StructField("respuestas", ArrayType(StructType([
        StructField("correoEncuestado", StringType(), True),
        StructField("respuesta", ArrayType(StructType([
            StructField("idPregunta", IntegerType(), True),
            StructField("tipo", StringType(), True),
            StructField("texto", StringType(), True),
            StructField("respuesta", StringType(), True),
            StructField("option_seleccionada", StringType(), True)
        ])), True)
    ])), True)
])


# Función para procesar las respuestas
def procesar_respuestas_spark(questions_df, respuestas_df):
    respuestas_procesadas = {}
    for pregunta in questions_df.collect():
        id_pregunta = pregunta.idPregunta
        tipo = pregunta.tipo
        texto = pregunta.texto

        if tipo == "abierta":
            respuestas_procesadas[id_pregunta] = respuestas_df.filter(col("idPregunta") == id_pregunta).select("respuesta").collect()
        elif tipo == "numerica":
            respuestas_procesadas[id_pregunta] = respuestas_df.filter(col("idPregunta") == id_pregunta).select(col("respuesta").cast(IntegerType())).collect()
        elif tipo == "eleccion_multiple":
            opciones = pregunta.options
            respuestas_procesadas[id_pregunta] = {opcion: 0 for opcion in opciones}
            counts = respuestas_df.filter(col("idPregunta") == id_pregunta).collect()
            for opcion in opciones:
                for row in counts:
                    if opcion in row['option_seleccionada']:
                        respuestas_procesadas[id_pregunta][opcion] += 1
            
        else:
            opciones = pregunta.options
            counts = respuestas_df.filter(col("idPregunta") == id_pregunta).groupBy("option_seleccionada").count().collect()
            respuestas_procesadas[id_pregunta] = {opcion: 0 for opcion in opciones}
            for row in counts:
                respuestas_procesadas[id_pregunta][row.option_seleccionada] = row['count']

    return respuestas_procesadas

# Crear gráficos y mostrar estadísticas
def crear_graficos_spark(doc, preguntas_df, respuestas_df):
    respuestas_procesadas = procesar_respuestas_spark(preguntas_df, respuestas_df)

    for pregunta in doc['questions']:
        st.header(pregunta['texto'])
        id_pregunta = pregunta['idPregunta']
        tipo = pregunta['tipo']

        if tipo == "abierta":
            st.write("Respuestas de texto:")
            for respuesta in respuestas_procesadas[id_pregunta]:
                st.write(f"- {respuesta['respuesta']}")
        
        elif tipo in ["eleccion_simple", "eleccion_multiple", "Si/No", "escala_calificacion"]:
            st.write("Distribución de respuestas:")
            df = pd.DataFrame(list(respuestas_procesadas[id_pregunta].items()), columns=['Opción', 'Frecuencia'])
            st.bar_chart(df.set_index('Opción'))
        
        elif tipo == "numerica":
            st.write("Estadísticas numéricas:")
            valores = [r['respuesta'] for r in respuestas_procesadas[id_pregunta]]
            df = pd.DataFrame(valores, columns=['Valor'])
            st.write(df.describe())


def main():
    st.title("Análisis de Encuestas")
    

    # Obtener las encuestas desde MongoDB
    data = collection.find()
    # Convertir el cursor a una lista de diccionarios
    data_list = list(data)

    for doc in data_list:
        st.header(doc["titulo"])
        

        df = spark.createDataFrame([doc], schema=schema)
        ###########################################################################################
        # Analisis de cantidad de Respuestas por Correo Electrónico
        st.subheader("Cantidad de Respuestas por Correo Electrónico:")

        # Cuenta la cantidad de respuestas únicas por correo
        respuestas_por_correo = df.groupBy("respuestas.correoEncuestado").agg(countDistinct("respuestas.correoEncuestado").alias("Cantidad"))
        #print(df.show(truncate=False))

        # Convierte el DataFrame de Spark a un DataFrame de Pandas y lo muestra
        st.write(respuestas_por_correo.toPandas())
        ###########################################################################################

        # Analisis de distribución de tipos de pregunta
        st.subheader("Distribución de Tipos de Pregunta:")

        # Crea un DataFrame con una fila por pregunta
        df_exploded = df.select(explode("questions").alias("question"))

        # Cuenta la cantidad de preguntas de cada tipo
        question_types_counts = df_exploded.groupBy("question.tipo").count()

        # Convierte el DataFrame de Spark a un DataFrame de Pandas y lo muestra
        st.write(question_types_counts.toPandas())

        ###########################################################################################

        # Analisis de cantidad de respuestas por pregunta

        # Crea un DataFrame con una fila por pregunta
        questions_df = df.select(explode(col("questions")).alias("question")).select("question.*")

        # Crea un DataFrame con una fila por respuesta
        respuestas_df = df.select(explode(col("respuestas")).alias("respuesta")).select("respuesta.*")
        respuestas_df = respuestas_df.withColumn("respuesta", explode(col("respuesta"))).select("correoEncuestado", "respuesta.*")

        # Crear gráficos para la encuesta
        crear_graficos_spark(doc, questions_df, respuestas_df)
        st.write("-------------------------------------------------------------------")

if __name__ == "__main__":
    main()
    time.sleep(10)
    st.experimental_rerun()