from database import engine, Base
from database_models import Product

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")
