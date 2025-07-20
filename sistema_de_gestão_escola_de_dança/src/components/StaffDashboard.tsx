import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ClassManagement } from "./ClassManagement";
import { StudentManagement } from "./StudentManagement";
import { EnrollmentManagement } from "./EnrollmentManagement";

interface StaffDashboardProps {
  staff: any;
}

export function StaffDashboard({ staff }: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: "📊" },
    { id: "classes", label: "Turmas", icon: "🎭" },
    { id: "students", label: "Alunos", icon: "👥" },
    { id: "enrollments", label: "Matrículas", icon: "📝" },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="modern-card p-8 gradient-bg-primary">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">👨‍💼</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Olá, {staff.fullName}!
            </h2>
            <p className="text-gray-700 text-lg font-medium">
              {staff.role === "admin" ? "Administrador" : 
               staff.role === "professor" ? "Professor" : "Funcionário"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="modern-card overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6">
          <div className="tab-nav max-w-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${
                  activeTab === tab.id ? "tab-button-active" : "tab-button-inactive"
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="slide-container">
          <div className="slide-content p-8">
            {activeTab === "overview" && <OverviewTab staff={staff} />}
            {activeTab === "classes" && <ClassManagement staff={staff} />}
            {activeTab === "students" && <StudentManagement staff={staff} />}
            {activeTab === "enrollments" && <EnrollmentManagement staff={staff} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ staff }: { staff: any }) {
  const classes = useQuery(api.classes.listActiveClasses);
  const students = useQuery(api.students.listStudents, { status: "ativo" });

  if (classes === undefined || students === undefined) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center space-y-4">
          <div className="loading-spinner w-12 h-12 mx-auto"></div>
          <p className="text-gray-600 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 slide-up">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Visão Geral</h3>
        <p className="text-gray-600">Resumo das atividades do sistema</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="modern-card-sm p-6 gradient-bg-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Turmas Ativas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{classes.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🎭</span>
            </div>
          </div>
        </div>

        <div className="modern-card-sm p-6 gradient-bg-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Alunos Ativos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="modern-card-sm p-6 gradient-bg-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Seu Perfil</p>
              <p className="text-xl font-bold text-gray-900 mt-2 capitalize">{staff.role}</p>
            </div>
            <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📝</span>
            </div>
          </div>
        </div>
      </div>

      {/* Turmas Recentes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-bold text-gray-900">Turmas Ativas</h4>
          <span className="text-sm text-gray-500">{classes.length} turmas encontradas</span>
        </div>
        
        {classes.length === 0 ? (
          <div className="modern-card-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">🎭</span>
            </div>
            <p className="text-gray-600 font-medium">Nenhuma turma ativa encontrada</p>
            <p className="text-sm text-gray-500 mt-2">Crie sua primeira turma para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.slice(0, 6).map((classItem) => (
              <div key={classItem._id} className="modern-card-sm p-6 hover:scale-105 transition-transform duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h5 className="font-bold text-gray-900 text-lg">{classItem.modality}</h5>
                  <span className="status-active">{classItem.level}</span>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Tipo:</span>
                    <span>{classItem.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Valor:</span>
                    <span className="font-bold text-emerald-600">R$ {classItem.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Duração:</span>
                    <span>{classItem.duration} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
