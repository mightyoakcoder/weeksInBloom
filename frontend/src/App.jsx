import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PlantsPage from './pages/Plants.jsx';
import PlantDetail from './pages/PlantDetail.jsx';
import WateringPage from './pages/Watering.jsx';
import HarvestPage from './pages/Harvest.jsx';
import SchedulePage from './pages/Schedule.jsx';
import { ToastProvider } from './hooks/useToast.jsx';

export default function App() {
  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plants" element={<PlantsPage />} />
            <Route path="/plants/:id" element={<PlantDetail />} />
            <Route path="/watering" element={<WateringPage />} />
            <Route path="/harvest" element={<HarvestPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
