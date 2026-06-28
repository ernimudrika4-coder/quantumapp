import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import MobileLayout from "./layouts/MobileLayout";
import PublicLayout from "./layouts/PublicLayout";
import PublicHomePage from "./pages/PublicHomePage";
import HomePage from "./pages/HomePage";
import MarketDetailPage from "./pages/MarketDetailPage";
import { SignalsPage, MarketsPage, NewsPage, ProfilePage } from "./pages/Pages";
import { Toasts, SearchModal, NotificationDrawer } from "./components/UI";
import { SignalDetailModal } from "./pages/SignalDetailModal";
import { NewsDetailModal } from "./pages/NewsDetailModal";

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<PublicHomePage />} />
            </Route>

            <Route path="/app" element={<MobileLayout />}>
              <Route index element={<HomePage />} />
              <Route path="signals" element={<SignalsPage />} />
              <Route path="markets" element={<MarketsPage />} />
              <Route path="markets/:symbol" element={<MarketDetailPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<PublicHomePage />} />
          </Routes>
          {/* Global overlays */}
          <Toasts />
          <SearchModal />
          <NotificationDrawer />
          <SignalDetailModal />
          <NewsDetailModal />
        </AppProvider>
      </AuthProvider>
    </HashRouter>
  );
}
