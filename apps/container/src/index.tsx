import * as React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Lazy load the Microfrontends
const Absences = React.lazy(() => import('absences/Module'));
const Profile = React.lazy(() => import('profile/Module'));

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="dashboard-layout">
        {/* Navigation Bar */}
        <nav style={{ padding: '1rem', background: '#eee' }}>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/absences">Absences</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>

        {/* The Stage where apps appear */}
        <React.Suspense fallback={<div>Loading App...</div>}>
          <Routes>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/absences/*" element={<Absences />} />
            <Route path="/profile/*" element={<Profile />} />
          </Routes>
        </React.Suspense>
      </div>
    </QueryClientProvider>
  );
}

function HomeDashboard() {
  return <h1>Welcome to the Corporate Dashboard</h1>;
}

export default App;