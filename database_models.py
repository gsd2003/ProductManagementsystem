from sqlalchemy import Column, Integer, String, Float,ForeignKey
from database import Base;
from sqlalchemy.orm import relationship


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True,autoincrement=True)
    name = Column(String(100))
    price = Column(Float)
    description = Column(String(255))
    stock = Column(Integer)
    imagepath = Column(String(255), nullable=True)
    categoryid = Column(Integer,ForeignKey("category.categoryid"))
    



class Category(Base):
    __tablename__ = "category"

    categoryid = Column(Integer, primary_key=True, index=True,autoincrement=True)
    Categorytype = Column(String(70))  



class Login(Base):
    __tablename__ = "login"


    username = Column(String(100), primary_key=True, index=True)
    password = Column(String(100))
