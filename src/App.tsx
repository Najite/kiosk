import { useState } from 'react';
import { TopBar, type ViewId } from '@/components/TopBar';
import { WalletProvider } from '@/context/WalletContext';
import { LandingPage } from '@/views/LandingPage';
import { KioskManager } from '@/views/KioskManager';
import { PolicyEngine } from '@/views/PolicyEngine';
import { WidgetCustomizer } from '@/views/WidgetCustomizer';
import { Marketplace } from '@/views/Marketplace';

function App() {
  const [route, setRoute] = useState<'landing' | 'dashboard'>(() => {
    try {
      const saved = localStorage.getItem('stellarkiosk_route');
      return saved === 'dashboard' ? 'dashboard' : 'landing';
    } catch {
      return 'landing';
    }
  });

  const [activeView, setActiveView] = useState<ViewId>(() => {
    try {
      const saved = localStorage.getItem('stellarkiosk_view') as ViewId;
      if (['kiosk', 'policy', 'widget', 'marketplace'].includes(saved)) {
        return saved;
      }
      return 'kiosk';
    } catch {
      return 'kiosk';
    }
  });

  const handleSetRoute = (r: 'landing' | 'dashboard') => {
    setRoute(r);
    try {
      localStorage.setItem('stellarkiosk_route', r);
    } catch {}
    window.scrollTo(0, 0);
  };

  const handleSetView = (v: ViewId) => {
    setActiveView(v);
    try {
      localStorage.setItem('stellarkiosk_view', v);
    } catch {}
  };

  const enterDashboard = (targetView?: ViewId) => {
    if (targetView) {
      handleSetView(targetView);
    }
    handleSetRoute('dashboard');
  };

  if (route === 'landing') {
    return <LandingPage onEnter={enterDashboard} />;
  }

  return (
    <WalletProvider>
      <div className="min-h-screen bg-obsidian bg-grid-pattern bg-[size:32px_32px]">
        <div className="min-h-screen bg-cyan-glow">
          <TopBar
            activeView={activeView}
            onViewChange={handleSetView}
            onExit={() => handleSetRoute('landing')}
          />
          <main className="max-w-7xl mx-auto px-4 lg:px-6 py-5">
            {activeView === 'kiosk' && <KioskManager />}
            {activeView === 'policy' && <PolicyEngine />}
            {activeView === 'widget' && <WidgetCustomizer />}
            {activeView === 'marketplace' && <Marketplace />}
          </main>
        </div>
      </div>
    </WalletProvider>
  );
}

export default App;
