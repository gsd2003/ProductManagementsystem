from fastapi import FastAPI, Depends, Form, HTTPException, UploadFile, File,Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel

import uvicorn
import os
import shutil
import uuid


from database import SessionLocal
import database_models
from models import ProductResponse, category
from database_models import Category, Login, Product


app = FastAPI()




BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

# Create uploads folder if not exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Serve images
app.mount("/images", StaticFiles(directory=UPLOAD_FOLDER), name="images")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/products")
async def add_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    image: UploadFile = File(...),
    categoryid: int = Form(...),
    db: Session = Depends(get_db)
):
    try:
        print("IMAGE NAME:", image.filename)
        print("FORM DATA:", name, description, price, stock)

        # ✅ Sanitize filename
        safe_name = image.filename.replace(" ", "_")

        # ✅ Build file path
        file_path = os.path.join(UPLOAD_FOLDER, safe_name)

        # ✅ Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        
        image_url = f"http://43.205.238.200:8000/images/{safe_name}"

        # ✅ Save product to DB
        new_product = database_models.Product(
            name=name,
            description=description,
            price=price,
            stock=stock,
            imagepath=image_url,
            categoryid=categoryid
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return new_product

    except Exception as e:
        print("🔥 BACKEND ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------------------------
# ✅ GET PRODUCTS
# -------------------------------------------------
@app.get("/products")
def get_all_products(
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit

    # ✅ Total count
    total = db.query(Product).count()

    # ✅ Paginated query
    results = (
        db.query(Product, Category)
        .join(Category, Product.categoryid == Category.categoryid)
        .offset(offset)
        .limit(limit)
        .all()
    )

    response = []
    for product, category in results:
        response.append({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "description": product.description,
            "stock": product.stock,
            "imagepath": product.imagepath,
            "categoryid": product.categoryid,
            "category_type": category.Categorytype
        })

    return {
        "data": response,   # ✅ frontend friendly
        "total": total,
        "page": page,
        "limit": limit
    }



# -------------------------------------------------
# ✅ UPDATE PRODUCT
# -------------------------------------------------
@app.put("/products/{id}", response_model=ProductResponse)
def update_product(id: int,  product: dict, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product)\
                   .filter(database_models.Product.id == id)\
                   .first()

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in product.items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product

# -------------------------------------------------
# ✅ DELETE PRODUCT
# -------------------------------------------------
@app.delete("/products/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
                   
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}

# -------------------------------------------------
# ✅ LOGIN
# -------------------------------------------------
class LoginSchema(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(Login).filter(
        Login.username == data.username,
        Login.password == data.password
    ).first()

    if user:
        return {"message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
 #Change image
@app.put("/products/{id}/image")
def update_product_image(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    product = db.query(database_models.Product)\
                .filter(database_models.Product.id == id)\
                .first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # ✅ Delete old image
    if product.imagepath:
        old_filename = product.imagepath.split("/")[-1]   # extract filename
        old_path = os.path.join(UPLOAD_FOLDER, old_filename)

        if os.path.exists(old_path):
            os.remove(old_path)

    # ✅ Generate unique filename
    ext = file.filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    new_path = os.path.join(UPLOAD_FOLDER, new_filename)

    # ✅ Save new image
    with open(new_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ✅ Update DB
    new_image_url = f"http://13.232.170.0:8000/images/{new_filename}"
    product.imagepath = new_image_url
    db.commit()
    db.refresh(product)

    return {
        "message": "Image updated successfully",
        "image_url": new_image_url
    }



@app.get("/products/search")
def search_products(
    q: str = Query(""),
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit

    products = (
    db.query(Product, Category)
    .join(Category, Product.categoryid == Category.categoryid)
    .filter(
        (Product.name.like(f"%{q}%")) |
        (Product.description.like(f"%{q}%"))
    )
    .offset(offset)
    .limit(limit)
    .all()
)

    total = (
        db.query(Product)
        .filter(
            (Product.name.like(f"%{q}%")) |
            (Product.description.like(f"%{q}%"))
        )
        .count()
    )

    result_data = []
    for product, category in products:
        result_data.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "imagepath": product.imagepath,
            "categoryid": product.categoryid,
            "category_type": category.Categorytype
        })

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "products": result_data

    }
@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/products/{categoryid}")
def get_products_by_category(
    categoryid: int,                       # ✅ Path param
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1),
    db: Session = Depends(get_db)
):

    print("Received categoryid:", categoryid)

    query = (
        db.query(Product, Category)
        .join(Category, Product.categoryid == Category.categoryid)
        .filter(Product.categoryid == categoryid)
    )

    total = query.count()

    results = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    products = []
    for product, category in results:
        products.append({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "description": product.description,
            "stock": product.stock,
            "imagepath": product.imagepath,
            "categoryid": product.categoryid,
            "category_type": category.Categorytype,
        })

    return {
        "data": products,
        "total": total,
        "page": page,
        "limit": limit
    }



if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
