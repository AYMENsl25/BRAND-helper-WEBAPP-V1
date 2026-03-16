
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Lab from './pages/Lab'
import ProjectDetail from './pages/ProjectDetail'
import Profile from './pages/Profile'
import Resources from './pages/Resources'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/lab" element={
        <ProtectedRoute><Lab /></ProtectedRoute>
      } />
      <Route path="/project/:id" element={
        <ProtectedRoute><ProjectDetail /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/resources" element={
        <ProtectedRoute><Resources /></ProtectedRoute>
      } />
    </Routes>
  )
}

export default App