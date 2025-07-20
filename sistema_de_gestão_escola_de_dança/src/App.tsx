import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { StudentDashboard } from "./components/StudentDashboard";
import { StaffDashboard } from "./components/StaffDashboard";
import { ProfileSetup } from "./components/ProfileSetup";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎭</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Espaço Vila Dança & Arte
              </h1>
            </div>
            <Authenticated>
              <SignOutButton />
            </Authenticated>
          </div>
        </div>
      </header>
      
      <main className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Content />
        </div>
      </main>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          },
        }}
      />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const studentProfile = useQuery(api.students.getMyStudentProfile);
  const staffProfile = useQuery(api.staff.getMyStaffProfile);

  if (loggedInUser === undefined || studentProfile === undefined || staffProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center space-y-4">
          <div className="loading-spinner w-12 h-12 mx-auto"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <div className="modern-card p-8 slide-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎭</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo!</h2>
              <p className="text-gray-600">Faça login para acessar o sistema</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {!studentProfile && !staffProfile ? (
          <ProfileSetup />
        ) : staffProfile ? (
          <StaffDashboard staff={staffProfile} />
        ) : (
          <StudentDashboard student={studentProfile} />
        )}
      </Authenticated>
    </div>
  );
}
