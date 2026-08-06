import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SignInGate } from "./components/common/SignInGate";
import { AppShell } from "./components/layout/AppShell";
import { OverviewPage } from "./pages/OverviewPage";
import { CopilotPage } from "./pages/CopilotPage";
import { MachinesPage } from "./pages/MachinesPage";
import { WhatIfPage } from "./pages/WhatIfPage";
import { AlertsPage } from "./pages/AlertsPage";
import { ModelConfidencePage } from "./pages/ModelConfidencePage";
import { ReportsPage } from "./pages/ReportsPage";
import { WorkOrdersPage } from "./pages/WorkOrdersPage";
import { AdministrationPage } from "./pages/AdministrationPage";
import { TrainingDataPage } from "./pages/TrainingDataPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SignInGate>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/copilot" element={<CopilotPage />} />
              <Route path="/machines" element={<MachinesPage />} />
              <Route path="/what-if" element={<WhatIfPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/model-confidence" element={<ModelConfidencePage />} />
              <Route path="/training-data" element={<TrainingDataPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/work-orders" element={<WorkOrdersPage />} />
              <Route path="/administration" element={<AdministrationPage />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SignInGate>
    </QueryClientProvider>
  );
}

export default App;
