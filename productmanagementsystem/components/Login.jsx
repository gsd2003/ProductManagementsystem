import { useState } from "react";
import { Form, Button,Card,Nav,Navbar, Container} from "react-bootstrap";
import {useNavigate} from 'react-router-dom';



export default function Login() {

    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://43.205.146.220:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"   
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    alert(data.message);

    navigate("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    alert("Invalid username or password");
  }
};
  return (
    <Container>
    <Navbar bg="warning" variant="dark" expand="lg" fixed="top" className="shadow-sm">
        
          <Navbar.Brand>🛒 Product Management System</Navbar.Brand>
         
        </Navbar>
      
    
    <Card style={{ width: '30%', margin: '100px auto', padding: '20px' }}>
      <Card.Body>
        <Card.Title className="mb-4">Login</Card.Title>
    <Form >
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
        
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit" onClick={handleLogin}>
        Login
      </Button>
    </Form>
    </Card.Body>
    </Card>
  </Container>  
  )
   
}