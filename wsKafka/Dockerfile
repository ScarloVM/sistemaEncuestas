FROM python:3.11

ENV DB_HOST='db'
ENV DB_PORT=5432
ENV DB_NAME='sistemaencuestas'
ENV DB_USER='postgres'
ENV DB_PASSWORD='mysecretpassword'


WORKDIR /opt/app

COPY . .

# Copiar el archivo de requisitos
COPY requirements.txt ./

# Instalar las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

VOLUME /data_store
EXPOSE 5000

# Command "python3 -m flask run --host=0.0.0.0"
CMD ["python3", "-m", "flask", "run", "--host=0.0.0.0"]

