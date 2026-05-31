import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import MoviePage from './pages/MoviePage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/vibeflix">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/movie/:id" element={<MoviePage />} />
        <Route path="/tv/:id" element={<MoviePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
