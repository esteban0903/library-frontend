import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import UsuariosPage from './pages/UsuariosPage';
import LibrosPage from './pages/LibrosPage';
import PrestamosPage from './pages/PrestamosPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/libros" element={<LibrosPage />} />
          <Route path="/prestamos" element={<PrestamosPage />} />
          <Route path="*" element={<Navigate to="/usuarios" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
