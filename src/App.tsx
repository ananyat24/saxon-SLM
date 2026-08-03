import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SignInGate } from "./components/common/SignInGate";
import { AppShell } from "./components/layout/AppShell";
import { OverviewPage } from "./pages/OverviewPage";
import { CopilotPage } from "./pages/CopilotPage";
import { ComingSoon } from "./pages/ComingSoon";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const STUB_ROUTES: { path: string; title: string }[] = [
  { path: "/machines", title: "Machines" },
  { path: "/live-assessment", title: "Live Assessment" },
  { path: "/what-if", title: "What-If Simulator" },
  { path: "/alerts", title: "Alerts" },
  { path: "/model-confidence", title: "Model Confidence" },
  { path: "/reports", title: "Reports" },
  { path: "/work-orders", title: "Work Orders" },
  { path: "/administration", title: "Administration" },
];

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
              {STUB_ROUTES.map((r) => (
                <Route key={r.path} path={r.path} element={<ComingSoon title={r.title} />} />
              ))}
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SignInGate>
    </QueryClientProvider>
  );
}

export default App;
