import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Landing from './pages/Landing'
import Assessment from './pages/Assessment'
import Dashboard from './pages/Dashboard'
import Activity from './pages/Activity'

const App: React.FC = () => {
  const { currentUser } = useAuth()

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/assessment"
            element={
              <PrivateRoute>
                <Assessment />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <PrivateRoute>
                <Activity />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App 