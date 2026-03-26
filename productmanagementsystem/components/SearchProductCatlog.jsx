import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";

export default function SearchProductCatlog() {

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const limit = 5;

  // ✅ Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://43.205.146.220:8000/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Load products whenever page or category changes
  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory]);

  const fetchProducts = async () => {
  try {
    let url = "";

    
    if (selectedCategory) {
      url = `http://43.205.238.200:8000/products/${selectedCategory}?page=${page}&limit=${limit}`;
    }

    else {
      url = `http://43.205.238.200:8000/products?page=${page}&limit=${limit}`;
    }

    console.log("Fetching URL:", url);

    const res = await fetch(url);
    const data = await res.json();

    // ✅ Safe response handling
    if (Array.isArray(data?.data)) {
      setProducts(data.data);
    } 
    else if (Array.isArray(data)) {
      setProducts(data);
    } 
    else {
      setProducts([]);
    }

  } catch (error) {
    console.error("Product fetch failed:", error);
    setProducts([]);
  }
};
  return (
    <div style={{ paddingTop: 70, width: "90%", margin: "auto" }}>

      <Navbar bg="warning" variant="dark" fixed="top">
        <Navbar.Brand className="ms-3">
          Product Management System
        </Navbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link href="/searchbyname" style={{ color: "white" }}>
            Search by Name/Description
          </Nav.Link>
        </Nav>
      </Navbar>

      <h2 className="text-center mb-3">🔍 Search Product Catalog</h2>

      <Form className="mb-4 d-flex gap-2">
       <Form.Select
    className="category-dropdown"
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
  >
    <option value="">Select Category</option>
    {categories.map((c) => (
      <option key={c.categoryid} value={c.categoryid}>
        {c.Categorytype}
      </option>
    ))}
  </Form.Select>
       


       
      </Form>
<Card className="shadow border-0">
      <Card.Body className="p-0">
        <Table hover responsive className="mb-0 product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="fw-bold">{p.id}</td>

                <td>
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={p.imagepath}
                      alt={p.name}
                      width={60}
                      height={60}
                      className="product-img"
                      onError={(e) => (e.target.src = "/placeholder.jpg")}
                    />

                    <div>
                      <div className="fw-semibold">{p.name}</div>
                      <div className="stock-text">Stock: {p.stock}</div>
                    </div>
                  </div>
                </td>

                <td>{p.description}</td>

                <td className="price-text">₹{p.price}</td>

                <td>
                  <Badge bg="success">{p.category_type}</Badge>
                </td>

                <td>
                
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>

      {/* 🔄 Pagination */}
      <div className="d-flex gap-3 align-items-center">
        <Button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ⬅ Prev
        </Button>

        <strong>Page {page}</strong>

        <Button
          disabled={products.length < limit}
          onClick={() => setPage(page + 1)}
        >
          Next ➡
        </Button>
      </div>

    </div>
  );
}