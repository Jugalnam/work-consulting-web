import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AnalyticsProvider } from './components/AnalyticsProvider'
import { SEOHead } from './components/SEOHead'
import { siteConfig } from './config/siteConfig'
import { Home } from './pages/Home'
import { Privacy } from './pages/Privacy'

export default function App() {
  return (
    <HelmetProvider>
      <AnalyticsProvider>
        <SEOHead />
        {siteConfig.routing === 'single' ? (
          <Home />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          </BrowserRouter>
        )}
      </AnalyticsProvider>
    </HelmetProvider>
  )
}
