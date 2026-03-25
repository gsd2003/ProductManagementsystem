
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base


db_url="mysql+pymysql://root:root@172.31.44.234:3306:3306/mydb"
engine = create_engine(db_url,echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

