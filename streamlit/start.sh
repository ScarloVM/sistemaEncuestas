pyspark --packages org.mongodb.spark:mongo-spark-connector_2.12:3.0.1 &
sleep 5 
streamlit run app.py server.port=8501 --server.address=0.0.0.0