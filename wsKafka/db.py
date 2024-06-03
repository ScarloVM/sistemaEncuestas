import psycopg2


class Database:
    def __init__(
        self, database="db_name", host="db_host", user="db_user", password="db_pass", port="db_port"
    ):
        self.conn = psycopg2.connect(
            database=database, host=host, user=user, password=password, port=port
        )

    def get_tasks(self):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM tasks;")
        data = cursor.fetchall()
        cursor.close()
        return data
    
    def get_task_by_id(self, task_id):
        cursor = self.conn.cursor()
        cursor.execute(f"SELECT * FROM tasks WHERE id = {task_id};")
        data = cursor.fetchall()
        cursor.close()
        return data

    def create_task(self, task):
        cursor = self.conn.cursor()
        cursor.execute(
            f"INSERT INTO tasks (name, description) VALUES ('{task['name']}', '{task['description']}');"
        )
        self.conn.commit()
        cursor.close()
        return task

    def update_task(self, request_task):
        cursor = self.conn.cursor()
        cursor.execute(
            f"UPDATE tasks SET name = '{request_task['name']}', description = '{request_task['description']}' WHERE id = {request_task['id']};"
        )
        self.conn.commit()
        cursor.close()
        return request_task

    def delete_task(self, request_task_id):
        cursor = self.conn.cursor()
        cursor.execute(f"DELETE FROM tasks WHERE id = {request_task_id};")
        self.conn.commit()
        cursor.close()
        return request_task_id
    
    def get_users(self):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM users;")
        data = cursor.fetchall()
        cursor.close()
        return data

    def get_user_by_id(self, user_id):
        cursor = self.conn.cursor()
        cursor.execute(f"SELECT * FROM users WHERE id = {user_id};")
        data = cursor.fetchall()
        cursor.close()
        return data
    
    def create_user(self, user):
        cursor = self.conn.cursor()
        cursor.execute(
            f"INSERT INTO users (name, password) VALUES ('{user['name']}', '{user['password']}');"
        )
        self.conn.commit()
        cursor.close()
        return user
    
    def update_user(self, request_user):
        cursor = self.conn.cursor()
        cursor.execute(
            f"UPDATE users SET name = '{request_user['name']}', password = '{request_user['password']}' WHERE id = {request_user['id']};"
        )
        self.conn.commit()
        cursor.close()
        return request_user
    
    def delete_user(self, request_user_id):
        cursor = self.conn.cursor()
        cursor.execute(f"DELETE FROM users WHERE id = {request_user_id};")
        self.conn.commit()
        cursor.close()
        return request_user_id
