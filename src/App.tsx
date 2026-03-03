import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import SOS from "./pages/SOS";
import MusicPlayer from "./pages/MusicPlayer";
import RandomConnect from "./pages/RandomConnect";
import VoiceCall from "./pages/VoiceCall";
import VideoCall from "./pages/VideoCall";
import IncomingCall from "./pages/IncomingCall";
import FindUsers from "./pages/FindUsers";
import AIChat from "./pages/AIChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="max-w-lg mx-auto min-h-screen bg-background relative">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/sos" element={<ProtectedRoute><SOS /></ProtectedRoute>} />
              <Route path="/music" element={<ProtectedRoute><MusicPlayer /></ProtectedRoute>} />
              <Route path="/random" element={<ProtectedRoute><RandomConnect /></ProtectedRoute>} />
              <Route path="/voice-call/:id" element={<ProtectedRoute><VoiceCall /></ProtectedRoute>} />
              <Route path="/video-call/:id" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
              <Route path="/incoming-call/:id/:type" element={<ProtectedRoute><IncomingCall /></ProtectedRoute>} />
              <Route path="/find-users" element={<ProtectedRoute><FindUsers /></ProtectedRoute>} />
              <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
