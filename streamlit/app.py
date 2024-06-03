import time
import streamlit as st
import pandas as pd
from pymongo import MongoClient
from pyspark.sql.types import StructType, StructField, StringType, ArrayType, IntegerType
from pyspark.sql.functions import explode, col
from py2neo import Graph
from pyvis.network import Network
import streamlit.components.v1 as components

# Conexión a MongoDB
mongo_uri = "mongodb://root:example@mongo/admin"
client = MongoClient(mongo_uri)
db = client['sistemaEncuestas']
collection = db['encuestas']

# Crear sesión de Spark que se conecta al contenedor de Spark
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

# Conexión a Neo4j
neo4j_uri = "bolt://neo4j:7687"
graph = Graph(neo4j_uri, auth=("neo4j", "strongpassword123"))

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

def cargar_datos_neo4j(doc):
    graph = Graph("bolt://neo4j:7687", auth=("neo4j", "strongpassword123"))
    idEncuesta = doc["idEncuesta"]

    # Crear nodos de encuestados si no existen
    for respuesta in doc['respuestas']:
        correo_encuestado = respuesta['correoEncuestado']
        graph.run(
            """
            MERGE (e:Encuestado {correo: $correo, idEncuesta: $idEncuesta})
            """,
            correo=correo_encuestado,
            idEncuesta=idEncuesta
        )
    
    # Crear nodos de respuestas y relaciones RESPONDIO
    for respuesta in doc['respuestas']:
        correo_encuestado = respuesta['correoEncuestado']
        for r in respuesta['respuesta']:
            respuesta_value = r.get('respuesta') or r.get('option_seleccionada')
            graph.run(
                """
                MATCH (e:Encuestado {correo: $correo, idEncuesta: $idEncuesta})
                MERGE (res:Respuesta {idPregunta: $idPregunta, tipo: $tipo, texto: $texto, respuesta: $respuesta_value, idEncuesta: $idEncuesta})
                MERGE (e)-[:RESPONDIO]->(res)
                """,
                correo=correo_encuestado,
                idPregunta=r['idPregunta'],
                tipo=r['tipo'],
                texto=r['texto'],
                respuesta_value=respuesta_value,
                idEncuesta=idEncuesta
            )

    # Verificación de la carga de datos
    encuestados = graph.run("MATCH (e:Encuestado {idEncuesta: $idEncuesta}) RETURN COUNT(e) AS count", idEncuesta=idEncuesta).evaluate()
    respuestas = graph.run("MATCH (r:Respuesta {idEncuesta: $idEncuesta}) RETURN COUNT(r) AS count", idEncuesta=idEncuesta).evaluate()
    st.write(f"Encuestados cargados para encuesta {idEncuesta}: {encuestados}, Respuestas cargadas: {respuestas}")

def calcular_similitudes(idEncuesta):
    graph = Graph("bolt://neo4j:7687", auth=("neo4j", "strongpassword123"))

    graph.run("""
    MATCH (e1:Encuestado {idEncuesta: $idEncuesta})-[r1:RESPONDIO]->(res:Respuesta {idEncuesta: $idEncuesta})<-[r2:RESPONDIO]-(e2:Encuestado {idEncuesta: $idEncuesta})
    WHERE e1 <> e2
    WITH e1, e2, COUNT(res) AS respuestas_comunes
    WHERE respuestas_comunes > 1
    MERGE (e1)-[s:SIMILAR_A {respuestas_comunes: respuestas_comunes, idEncuesta: $idEncuesta}]->(e2)
    """, idEncuesta=idEncuesta)

    # Verificación
    total_similaridades = graph.evaluate("MATCH ()-[r:SIMILAR_A {idEncuesta: $idEncuesta}]->() RETURN count(r)", idEncuesta=idEncuesta)
    st.write(f"Total relaciones SIMILAR_A creadas para encuesta {idEncuesta}: {total_similaridades}")

def visualizar_grafo(idEncuesta):
    net = Network(notebook=True)

    query = """
    MATCH (e:Encuestado {idEncuesta: $idEncuesta})-[r:SIMILAR_A {idEncuesta: $idEncuesta}]->(e2:Encuestado {idEncuesta: $idEncuesta})
    RETURN e, r, e2
    """
    data = graph.run(query, idEncuesta=idEncuesta).data()

    added_nodes = set()  # Almacenar nodos ya agregados

    for record in data:
        e = record['e']
        e2 = record['e2']
        r = record['r']

        if e.identity not in added_nodes:
            net.add_node(e.identity, label=e['correo'], title=e['correo'])
            added_nodes.add(e.identity)

        if e2.identity not in added_nodes:
            net.add_node(e2.identity, label=e2['correo'], title=e2['correo'])
            added_nodes.add(e2.identity)

        net.add_edge(e.identity, e2.identity, value=r['respuestas_comunes'])

    net.show(f"grafo_{idEncuesta}.html")

def main():
    cursor = collection.find()
    encuestas_procesadas = set()  # Conjunto para almacenar IDs de encuestas procesadas

    for doc in cursor:
        idEncuesta = doc["idEncuesta"]

        if idEncuesta not in encuestas_procesadas:
            encuestas_procesadas.add(idEncuesta)  # Agregar ID de encuesta al conjunto de encuestas procesadas

            st.header(doc["titulo"])

            df = spark.createDataFrame([doc], schema=schema)
            df_exploded = df.select(explode("questions").alias("question"))
            question_types_counts = df_exploded.groupBy("question.tipo").count()
            st.write(question_types_counts.toPandas())

            questions_df = df.select(explode(col("questions")).alias("question")).select("question.*")
            respuestas_df = df.select(explode(col("respuestas")).alias("respuesta")).select("respuesta.*")
            respuestas_df = respuestas_df.withColumn("respuesta", explode(col("respuesta"))).select("correoEncuestado", "respuesta.*")
            crear_graficos_spark(doc, questions_df, respuestas_df)
            cargar_datos_neo4j(doc)
            calcular_similitudes(idEncuesta)
            st.header("Visualización del Grafo de Similitudes entre Encuestados con Neo4j")
            st.write(f"A continuación se muestra el grafo de similitudes entre encuestados para la encuesta {idEncuesta}. Los nodos representan encuestados y los bordes representan similitudes significativas en sus respuestas.")
            visualizar_grafo(idEncuesta)
            with open(f"grafo_{idEncuesta}.html", "r", encoding="utf-8") as file:
                graph_html = file.read()
            components.html(graph_html, height=800)

if __name__ == "__main__":
    main()
    time.sleep(30)
    st.experimental_rerun()