import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";  
import Nav from "react-bootstrap/Nav";  
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import { FaSearch, FaUpload, FaEdit, FaTrash } from "react-icons/fa";

export default function SearchbyNameDesc() {

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 5;

  
  const fetchProducts = async () => {
    try {
      const url = `http://43.205.238.200:8000/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      console.log("Fetching:", url);

      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }

    } catch (error) {
      console.error("Search failed:", error);
      setProducts([]);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, [page]);

 
  const search = () => {
    setPage(1);
    fetchProducts();
   
  };

  return (
    <div style={{ paddingTop: 70, width: "90%", margin: "auto" }}>
      <Navbar bg="warning" variant="dark" fixed="top">
        <Navbar.Brand className="ms-3">
          Product Management System
        </Navbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link href="/search" style={{ color: "white" }}>
           Search by category
          </Nav.Link>
        </Nav>
      </Navbar>
      <div className="search-section">
    <h3 className="search-title">
      <FaSearch className="me-2" />
      Search Products
    </h3>

    <div className="d-flex gap-2">
      <Form.Control
        placeholder="Search by name or description"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button variant="primary" onClick={search}>
        Search
      </Button>
    </div>
  </div>

  <Container className="mt-4">


    {/* ===== Products Table ===== */}
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

    {/* ===== Pagination ===== */}
    <div className="pagination-bar">
      <Button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        ⬅ Prev
      </Button>

      <span>Page {page}</span>

      <Button
        disabled={page * limit >= total}
        onClick={() => setPage(page + 1)}
      >
        Next ➡
      </Button>
    </div>

  </Container>

    </div>
  );
}