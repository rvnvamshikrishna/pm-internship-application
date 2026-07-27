from sqlalchemy import create_engine
try:
    engine = create_engine("mysql+pymysql://root:vamshi@localhost:3306/internship_recommendation")
    conn = engine.connect()
    print("Database connection successful!")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
