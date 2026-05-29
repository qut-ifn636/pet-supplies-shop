import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import CategoryList from './pages/CategoryList';
import UserList from './pages/UserList';

// Layout wrapper for every authenticated page
const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <div className="flex h-screen bg-teal-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes — no sidebar */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — sidebar layout */}
        <Route path="/dashboard"         element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/profile"           element={<ProtectedLayout><Profile /></ProtectedLayout>} />
        <Route path="/products"          element={<ProtectedLayout><ProductList /></ProtectedLayout>} />
        <Route path="/products/new"      element={<ProtectedLayout><AddProduct /></ProtectedLayout>} />
        <Route path="/products/edit/:id" element={<ProtectedLayout><EditProduct /></ProtectedLayout>} />
        <Route path="/categories"        element={<ProtectedLayout><CategoryList /></ProtectedLayout>} />
        <Route path="/users"             element={<ProtectedLayout><UserList /></ProtectedLayout>} />

        {/* Default: redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
