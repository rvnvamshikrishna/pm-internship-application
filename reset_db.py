import sys
import os

sys.path.insert(0, os.path.abspath('pm_internship_backend'))

from app.database import Base, engine
from app import models  # Important: import models so metadata is populated

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Database reset successfully!")
