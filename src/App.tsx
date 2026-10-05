import { useState } from 'react';
import { TopBar, type ViewId } from '@/components/TopBar';
import { WalletProvider } from '@/context/WalletContext';
import { LandingPage } from '@/views/LandingPage';
import { KioskManager } from '@/views/KioskManager';
import { PolicyEngine } from '@/views/PolicyEngine';
import { WidgetCustomizer } from '@/views/WidgetCustomizer';
import { Marketplace } from '@/views/Marketplace';
import { GrantProposal } from '@/views/GrantProposal';

function App() {
  const [route, setRoute] = useState<'landing' | 'dashboard'>('landing');
  const [activeView, setActiveView] = useState<ViewId>('kiosk');

  const enterDashboard = () => {
    setRoute('dashboard');
    window.scrollTo(0, 0);
  };

  if (route === 'landing') {
    return <LandingPage onEnter={enterDashboard} />;
  }

  return (
    <WalletProvider>
      <div className="min-h-screen bg-obsidian bg-grid-pattern bg-[size:32px_32px]">
        <div className="min-h-screen bg-cyan-glow">
          <TopBar activeView={activeView} onViewChange={setActiveView} onExit={() => setRoute('landing')} />
          <main className="max-w-7xl mx-auto px-4 lg:px-6 py-5">
            {activeView === 'kiosk' && <KioskManager />}
            {activeView === 'policy' && <PolicyEngine />}
            {activeView === 'widget' && <WidgetCustomizer />}
            {activeView === 'marketplace' && <Marketplace />}
            {activeView === 'grant' && <GrantProposal />}
          </main>
        </div>
      </div>
    </WalletProvider>
  );
}

export default App;
