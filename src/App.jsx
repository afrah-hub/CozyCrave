import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Products from "./components/Products";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderPlacement from "./pages/OrderPlacement";
import ProductView from "./pages/ProductView";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Notification from "./components/Notification";
import { AppProvider } from "./context/AppContext.jsx";
import "./App.css";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <Notification />
                <main>
                  <Hero />
                  <Products />
                  <About />
                  <Contact />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/products"
            element={
              <>
                <Header />
                <Notification />
                <main>
                  <Products />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/product/:id"
            element={
              <>
                <Header />
                <Notification />
                <main>
                  <ProductView />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Notification />
                <main>
                  <Login />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <Notification />
                <main>
                  <Register />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/cart"
            element={
              <>
                <Header />
                <Notification />
                <main>
                  <Cart />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/order-placement"
            element={
              <>
                <Header />
                <Notification />
                <main>
                  <ProtectedRoute><OrderPlacement /></ProtectedRoute>
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/wishlist"
            element={
              <>
                <Header />
                <Notification />
                <main>
                  <ProtectedRoute><Wishlist /></ProtectedRoute>
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                <Header />
                <Notification />
                <main>
                  <ProtectedRoute><Profile /></ProtectedRoute>
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/orders"
            element={
              <>
                <Header />
                <Notification />
                <main>
                  <ProtectedRoute><Orders /></ProtectedRoute>
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/admin"
            element={
              <>
                <Notification />
                <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
export default App;