import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface EnrollmentManagementProps {
  staff: any;
}

export function EnrollmentManagement({ staff }: EnrollmentManagementProps) {
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("");
  
  const classes = useQuery(api.classes.listActiveClasses);
  const students = useQuery(api.students.listStudents, { status: "ativo" });
  const enrollments = selectedClass 
    ? useQuery(api.enrollments.getEnrollmentsByClass, { classId: selectedClass as any })
    : undefined;

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Gestão de Matrículas</h3>
          <p className="text-gray-600 mt-1">Gerencie matrículas de alunos nas turmas</p>
        </div>
        <button
          onClick={() => setShowEnrollForm(true)}
          className="modern-button-primary"
        >
          <span className="mr-2">+</span>
          Nova Matrícula
        </button>
      </div>

      {showEnrollForm && (
        <EnrollmentForm 
          students={students}
          classes={classes}
          onClose={() => setShowEnrollForm(false)} 
        />
      )}

      {/* Class Selector */}
      <div className="modern-card p-6">
        <div className="form-group">
          <label className="form-label">
            Selecione uma turma para visualizar as matrículas:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="modern-select"
          >
            <option value="">Escolha uma turma</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.modality} - {classItem.level} ({classItem.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enrollments List */}
      {selectedClass && enrollments !== undefined && (
        <div className="modern-card overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-900">
                Alunos Matriculados
              </h4>
              <div className="modern-card-sm px-3 py-1">
                <span className="text-sm font-semibold text-gray-600">Total: </span>
                <span className="text-lg font-bold text-gray-900">{enrollments.length}</span>
              </div>
            </div>
          </div>
          
          {enrollments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">📝</span>
              </div>
              <p className="text-gray-600 font-medium">Nenhuma matrícula encontrada para esta turma</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="modern-table">
                <thead className="modern-table-header">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Data da Matrícula
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment._id} className="modern-table-row">
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">
                              {enrollment.student?.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {enrollment.student?.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.student?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm font-medium text-gray-900">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-6">
                        <span className={
                          enrollment.status === "ativa" ? "status-active" :
                          enrollment.status === "suspensa" ? "status-pending" : "status-inactive"
                        }>
                          {enrollment.status === "ativa" ? "Ativa" : 
                           enrollment.status === "suspensa" ? "Suspensa" : "Cancelada"}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={
                          enrollment.paymentStatus === "pago" ? "status-paid" :
                          enrollment.paymentStatus === "pendente" ? "status-pending" : "status-overdue"
                        }>
                          {enrollment.paymentStatus === "pago" ? "Pago" : 
                           enrollment.paymentStatus === "pendente" ? "Pendente" : "Atrasado"}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        {enrollment.status === "ativa" && (
                          <CancelEnrollmentButton enrollmentId={enrollment._id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EnrollmentForm({ students, classes, onClose }: { 
  students: any[], 
  classes: any[], 
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
  });

  const enrollStudent = useMutation(api.enrollments.enrollStudent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await enrollStudent({
        studentId: formData.studentId as any,
        classId: formData.classId as any,
      });
      
      toast.success("Aluno matriculado com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao matricular aluno: " + (error as Error).message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Nova Matrícula</h3>
              <p className="text-gray-600 mt-1">Matricule um aluno em uma turma</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
            >
              <span className="text-gray-600 text-xl">✕</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label">Aluno</label>
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="modern-select"
              >
                <option value="">Selecione um aluno</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.fullName} - {student.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Turma</label>
              <select
                required
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="modern-select"
              >
                <option value="">Selecione uma turma</option>
                {classes.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.modality} - {classItem.level} ({classItem.type}) - R$ {classItem.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="modern-button-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="modern-button-primary"
              >
                Matricular Aluno
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CancelEnrollmentButton({ enrollmentId }: { enrollmentId: string }) {
  const cancelEnrollment = useMutation(api.enrollments.cancelEnrollment);

  const handleCancel = async () => {
    if (confirm("Tem certeza que deseja cancelar esta matrícula?")) {
      try {
        await cancelEnrollment({ enrollmentId: enrollmentId as any });
        toast.success("Matrícula cancelada com sucesso!");
      } catch (error) {
        toast.error("Erro ao cancelar matrícula: " + (error as Error).message);
      }
    }
  };

  return (
    <button
      onClick={handleCancel}
      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
    >
      Cancelar
    </button>
  );
}
