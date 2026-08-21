import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ManagerDetails from './pages/ManagerDetails';
import Store from './pages/Store';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Leaderboard from './pages/Leaderboard';
import SupportChat from './components/SupportChat';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-transparent overflow-hidden flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/manager/:id" element={<ManagerDetails />} />
          <Route path="/store" element={<Store />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <SupportChat />
      </div>
    </Router>
  )
}

export default App;
