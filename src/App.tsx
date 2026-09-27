import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Trends } from './pages/Trends';
import { Locations } from './pages/Locations';
import { Workers } from './pages/Workers';
import { Flagged } from './pages/Flagged';
import { Export } from './pages/Export';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/flagged" element={<Flagged />} />
            <Route path="/export" element={<Export />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
