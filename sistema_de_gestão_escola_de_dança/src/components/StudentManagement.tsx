import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface StudentManagementProps {
  staff: any;
}

export function StudentManagement({ staff }: StudentManagementProps) {
  const students = useQuery(api.students.listStudents, {});

  if (students === undefined) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center space-y-4">
          <div className="loading-spinner w-12 h-12 mx-auto"></div>
          <p className="text-gray-600 font-medium">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Gestão de Alunos</h3>
          <p className="text-gray-600 mt-1">Gerencie todos os alunos cadastrados</p>
        </div>
        <div className="modern-card-sm px-4 py-2">
          <span className="text-sm font-semibold text-gray-600">Total: </span>
          <span className="text-lg font-bold text-gray-900">{students.length}</span>
          <span className="text-sm text-gray-600 ml-1">alunos</span>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="modern-card p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-gray-400">👥</span>
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">Nenhum aluno encontrado</h4>
          <p className="text-gray-600 mb-4">Os alunos aparecerão aqui após criarem seus perfis.</p>
        </div>
      ) : (
        <div className="modern-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead className="modern-table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Informações
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="modern-table-row">
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {student.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {student.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            CPF: {student.cpf}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {student.email}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.whatsapp}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {student.gender}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={student.status === "ativo" ? "status-active" : "status-inactive"}>
                        {student.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
