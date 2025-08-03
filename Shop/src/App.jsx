import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './layout/Navbar.jsx';
import Layout from './layout/Layout.jsx';
import CashBack from './pages/Cashback.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Purchases from './pages/Purchases.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Cashform from './pages/Cashform.jsx';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Pages with Navbar and Footer */}
          <Route path="/" element={
            <>
              <Navbar />
              <Layout>
                <CashBack />
              </Layout>
            </>
          } />
          
          <Route path="/dashboard" element={
            <>
              <Navbar />
              <Layout>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Layout>
            </>
          } />
          
          <Route path="/purchases" element={
            <>
              <Navbar />
              <Layout>
                <ProtectedRoute>
                  <Purchases />
                </ProtectedRoute>
              </Layout>
            </>
          } />
          
          {/* Pages without Navbar and Footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cashform"  element= {<Cashform/>}/>

        </Routes>
      </div>
    </Router>
  );
}

export default App;
