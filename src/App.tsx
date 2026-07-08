import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { CustomerPage } from "./pages/CustomerPage";
import { OwnerPage } from "./pages/OwnerPage";

function AppContent() {
  const { currentRole } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Dynamic Header */}
      <Header />

      {/* Main Viewport */}
      <main className="flex-1 bg-slate-50">
        {currentRole === "customer" ? <CustomerPage /> : <OwnerPage />}
      </main>

      {/* Dynamic Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
