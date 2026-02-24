
from pydantic import BaseModel
from typing import Optional


class Product(BaseModel):
   
    name: str
    description: str
    price: float
    stock: int
    imagepath: Optional[str] = None
    categoryid: int

class ProductResponse(Product):
    id: int
    description: str
    price: float
    stock: int
    name: str
    categoryid: int

    class Config:
        from_attributes = True



class category(BaseModel):
    categoryid: int
    Categorytype: str