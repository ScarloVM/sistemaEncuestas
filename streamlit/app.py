import streamlit as st
import pandas as pd
from pymongo import MongoClient
from pyspark.sql.types import StructType, StructField, StringType, ArrayType, IntegerType
from pyspark.sql.functions import explode, col

# MongoDB connection setup
mongo_uri = "mongodb://root:example@mongo/admin"
client = MongoClient(mongo_uri)
db = client['sistemaEncuestas']
collection = db['encuestas']

# Fetch data from MongoDB
data = collection.find_one({'idEncuesta': 1})

# Data processing with PySpark
from pyspark.sql import SparkSession
spark = SparkSession.builder \
    .appName("Streamlit_Analysis") \
    .master("local") \
    .getOrCreate()

# Define Schema
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
        StructField("correoEncuestado", IntegerType(), True),
        StructField("respuesta", ArrayType(StructType([
            StructField("idPregunta", IntegerType(), True),
            StructField("tipo", StringType(), True),
            StructField("texto", StringType(), True),
            StructField("respuesta", StringType(), True),
            StructField("option_seleccionada", StringType(), True)
        ])), True)
    ])), True)
])

df = spark.createDataFrame([data], schema=schema)

# Data manipulation with PySpark DataFrame
respuestas_por_correo = df.groupBy("respuestas.correoEncuestado").count()

# Streamlit app interface
st.title("Análisis de Encuestas")

# Cantidad de Respuestas por Correo Electrónico
st.subheader("Cantidad de Respuestas por Correo Electrónico:")
st.write(respuestas_por_correo.toPandas())

# Distribución de tipos de pregunta
st.subheader("Distribución de Tipos de Pregunta:")
# Explode the 'questions' array to create a row for each question
df_exploded = df.select(explode("questions").alias("question"))

# Group by question type and count the occurrences of each type
question_types_counts = df_exploded.groupBy("question.tipo").count()

# Convert to Pandas DataFrame for use in Streamlit
question_types_counts_pd = question_types_counts.toPandas()

st.write(question_types_counts_pd)


##############################################################

# Explorar las preguntas
questions_df = df.select(explode(col("questions")).alias("question")).select("question.*")
questions_df.show(truncate=False)

# Explorar las respuestas
respuestas_df = df.select(explode(col("respuestas")).alias("respuesta")).select("respuesta.*")
respuestas_df = respuestas_df.withColumn("respuesta", explode(col("respuesta"))).select("correoEncuestado", "respuesta.*")
respuestas_df.show(truncate=False)

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
    print(respuestas_procesadas)

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

# Crear gráficos para la encuesta
crear_graficos_spark(data, questions_df, respuestas_df)