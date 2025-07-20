import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface StudentDashboardProps {
  student: any;
}

export function StudentDashboard({ student }: StudentDashboardProps) {
  const enrollments = useQuery(api.enrollments.getMyEnrollments);

  if (enrollments === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center space-y-4">
          <div className="loading-spinner w-12 h-12 mx-auto"></div>
          <p className="text-gray-600 font-medium">Carregando suas informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="modern-card p-8 gradient-bg-primary">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">👨‍🎓</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Olá, {student.fullName}!
            </h2>
            <p className="text-gray-700 text-lg">Bem-vindo ao seu portal do aluno</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="modern-card p-8 slide-up">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nome Completo</label>
            <p className="text-lg font-medium text-gray-900">{student.fullName}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email</label>
            <p className="text-lg font-medium text-gray-900">{student.email}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">WhatsApp</label>
            <p className="text-lg font-medium text-gray-900">{student.whatsapp}</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</label>
            <div>
              <span className={student.status === "ativo" ? "status-active" : "status-inactive"}>
                {student.status === "ativo" ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* My Classes */}
      <div className="modern-card p-8 slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Minhas Turmas</h3>
          <div className="modern-card-sm px-3 py-1">
            <span className="text-sm font-semibold text-gray-600">Total: </span>
            <span className="text-lg font-bold text-gray-900">{enrollments.length}</span>
          </div>
        </div>
        
        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-gray-400">🎭</span>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Nenhuma turma encontrada</h4>
            <p className="text-gray-600 mb-4">Você ainda não está matriculado em nenhuma turma.</p>
            <p className="text-sm text-gray-500">
              Entre em contato com a secretaria para se matricular.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="modern-card-sm p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-900">
                    {enrollment.class?.modality}
                  </h4>
                  <span className="status-active">{enrollment.class?.level}</span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Tipo:</span>
                    <span className="text-gray-900">{enrollment.class?.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Duração:</span>
                    <span className="text-gray-900">{enrollment.class?.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Valor:</span>
                    <span className="font-bold text-emerald-600 text-lg">R$ {enrollment.class?.price?.toFixed(2)}</span>
                  </div>
                </div>
                
                {enrollment.class?.schedule && enrollment.class.schedule.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3">Horários:</p>
                    <div className="space-y-2">
                      {enrollment.class.schedule.map((schedule: any, index: number) => (
                        <div key={index} className="bg-gray-50 px-3 py-2 rounded-lg text-xs font-medium text-gray-700">
                          <span className="capitalize">{schedule.dayOfWeek}</span>: {schedule.startTime} - {schedule.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className={enrollment.status === "ativa" ? "status-active" : "status-inactive"}>
                    {enrollment.status === "ativa" ? "Ativa" : "Inativa"}
                  </span>
                  
                  <span className={
                    enrollment.paymentStatus === "pago" ? "status-paid" :
                    enrollment.paymentStatus === "pendente" ? "status-pending" : "status-overdue"
                  }>
                    {enrollment.paymentStatus === "pago" ? "Pago" : 
                     enrollment.paymentStatus === "pendente" ? "Pendente" : "Atrasado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
