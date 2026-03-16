import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Lab from './pages/Lab'
import ProjectDetail from './pages/ProjectDetail'
import Profile from './pages/Profile'
import Resources from './pages/Resources'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App