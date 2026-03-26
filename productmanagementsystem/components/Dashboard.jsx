import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Navbar, Container, Nav, Card, Table, Spinner, Modal, Badge, Row, Col, Alert } from "react-bootstrap";
import { FaImage, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import SearchProductCatlog from "./SearchProductCatlog"; // Assuming this is a link/component

const API = "http://43.205.238.200:8000/products";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", stock: "", imagepath: "", categoryid: "" });
  const [page, setPage] = useState(1);
  const limit = 5;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState({ show: false, product: null, type: "" });
  const [editForm, setEditForm] = useState({});
  

  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    fetchCategories();
  }, [page]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://43.205.238.200:8000/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?page=${page}&limit=${limit}`);
      const data = await res.json();
      setProducts(data.data || []);
      setTotal(data.total || 0);
      setError("");
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("stock", form.stock);
    fd.append("image", image);
    fd.append("categoryid", form.categoryid);

    try {
      const res = await fetch(API, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      setForm({ name: "", price: "", description: "", stock: "", categoryid: "" });
      setImage(null);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      loadProducts();
    } catch (err) {
      setError("Delete failed");
    }
  };

  const openEditModal = (product, type) => {
    setEditForm({ ...product });
    setShowModal({ show: true, product, type });
  };

  const handleEditChange = (field) => (e) => {
    setEditForm({ ...editForm, [field]: e.target.value });
  };

  const saveEdit = async () => {
    try {
      await fetch(`${API}/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setShowModal({ show: false });
      alert("Product updated successfully");
      loadProducts();
    } catch (err) {
      setError("Update failed");
    }
  };

  const uploadImage = async (productId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API}/${productId}/image`, { method: "PUT", body: formData });
      const data = await res.json();
      alert(data.message);
      loadProducts();
    } catch (err) {
      setError("Image upload failed");
    }
  };

  const handleLogout = () => navigate("/login");

  if (loading) return <div className="d-flex justify-content-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar bg="warning" variant="dark" expand="lg" fixed="top" className="shadow-sm">
        <Container>
          <Navbar.Brand>🛒 Product Management System</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate("/search")}>Search Catalog</Nav.Link>
            <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2">Logout</Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="pt-5 mt-5">
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {/* Add Form Card */}
        <Card className="mb-5 shadow-lg border-0">
          <Card.Body className="p-5">
            <Card.Title className="text-center text-warning fw-bold display-6 mb-4  ">ADD NEW PRODUCT</Card.Title>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select value={form.categoryid} onChange={(e) => setForm({ ...form, categoryid: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.categoryid} value={c.categoryid}>{c.Categorytype}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Image</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                </Form.Group>
                <Button variant="success" className="w-100" onClick={addProduct}>
                  Add Product
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Products Table Card */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <Card.Header className="bg-gradient text-black p-4">
            <h4 className="mb-0"><strong>Products List</strong> <Badge bg="info">{total} Total</Badge></h4>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover responsive className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="align-middle fw-bold">{p.id}</td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <img src={p.imagepath} width="50" height="50" className="rounded shadow me-3" alt={p.name} onError={(e) => e.target.src = '/placeholder.jpg'} />
                          <div>
                            <h6 className="mb-1">{p.name}</h6>
                            <small className="text-muted">Stock: {p.stock}</small>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">{p.description}</td>
                      <td className="align-middle fw-bold text-success">₹{p.price}</td>
                      <td className="align-middle">
                        <Badge bg="primary">{p.category_type}</Badge>
                      </td>
                      <td className="align-middle">
                        <div className="btn-group">
                          <input type="file" hidden id={`img-${p.id}`} onChange={(e) => uploadImage(p.id, e.target.files[0])} />
                          <label htmlFor={`img-${p.id}`} className="btn btn-outline-success btn-sm">
                            <FaUpload />
                          </label>
                          <Button variant="outline-warning" size="sm" onClick={() => openEditModal(p, 'edit')}>
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => deleteProduct(p.id)}>
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-4 gap-2">
          <Button disabled={page === 1} variant="outline-primary" onClick={() => setPage(page - 1)}>← Prev</Button>
          <span className="align-self-center fw-bold">Page {page} of {Math.ceil(total / limit)}</span>
          <Button disabled={page * limit >= total} variant="outline-primary" onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      </Container>

      {/* Edit Modal */}
      <Modal show={showModal.show} onHide={() => setShowModal({ show: false })}>
        <Modal.Header closeButton>
          <Modal.Title>Edit {showModal.product?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={editForm.name || ''} onChange={handleEditChange('name')} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" value={editForm.price || ''} onChange={handleEditChange('price')} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" value={editForm.description || ''} onChange={handleEditChange('description')} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" value={editForm.stock || ''} onChange={handleEditChange('stock')} />
            </Form.Group>
             <Form.Group className="mb-3">
              <Form.Label>Category Type</Form.Label>
              <Form.Select onChange={handleEditChange('categoryid')} value={editForm.categoryid || ''}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.categoryid} value={c.categoryid}>{c.Categorytype}</option>
                ))}
                
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal({ show: false })}>Cancel</Button>
          <Button variant="primary" onClick={saveEdit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

