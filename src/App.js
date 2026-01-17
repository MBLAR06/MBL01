import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

// Pages
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import ContentPage from "@/pages/ContentPage";
import EpisodePage from "@/pages/EpisodePage";
import SearchPage from "@/pages/SearchPage";
import LegalPage from "@/pages/LegalPage";
import PrivacyPage from "@/pages/PrivacyPage";
import ContactPage from "@/pages/ContactPage";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminContents from "@/pages/admin/AdminContents";
import AdminContentForm from "@/pages/admin/AdminContentForm";
import AdminSeasons from "@/pages/admin/AdminSeasons";
import AdminEpisodes from "@/pages/admin/AdminEpisodes";
import AdminAllSeasons from "@/pages/admin/AdminAllSeasons";
import AdminAllEpisodes from "@/pages/admin/AdminAllEpisodes";
import AdminSeasonForm from "@/pages/admin/AdminSeasonForm";
import AdminEpisodeForm from "@/pages/admin/AdminEpisodeForm";
import AdminCarousel from "@/pages/admin/AdminCarousel";
import AdminStats from "@/pages/admin/AdminStats";

// Layout
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <div className="App min-h-screen bg-[#020617]">
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          richColors 
          theme="dark"
          toastOptions={{
            style: {
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc'
            }
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/series" element={<CatalogPage type="serie" />} />
            <Route path="/miniseries" element={<CatalogPage type="miniserie" />} />
            <Route path="/peliculas" element={<CatalogPage type="pelicula" />} />
            <Route path="/anime" element={<CatalogPage type="anime" />} />
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/aviso-legal" element={<LegalPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/:type/:slug" element={<ContentPage />} />
            <Route path="/:type/:slug/temporada/:seasonSlug" element={<ContentPage />} />
            <Route path="/:type/:slug/temporada/:seasonSlug/episodio/:episodeSlug" element={<EpisodePage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/contenidos" element={<AdminContents />} />
            <Route path="/admin/contenidos/nuevo" element={<AdminContentForm />} />
            <Route path="/admin/contenidos/:id" element={<AdminContentForm />} />
            <Route path="/admin/contenidos/:id/temporadas" element={<AdminSeasons />} />
            <Route path="/admin/temporadas" element={<AdminAllSeasons />} />
            <Route path="/admin/temporadas/:seasonId/editar" element={<AdminSeasonForm />} />
            <Route path="/admin/temporadas/:seasonId/episodios" element={<AdminEpisodes />} />
            <Route path="/admin/episodios" element={<AdminAllEpisodes />} />
            <Route path="/admin/episodios/:episodeId/editar" element={<AdminEpisodeForm />} />
            <Route path="/admin/carrusel" element={<AdminCarousel />} />
            <Route path="/admin/estadisticas" element={<AdminStats />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
