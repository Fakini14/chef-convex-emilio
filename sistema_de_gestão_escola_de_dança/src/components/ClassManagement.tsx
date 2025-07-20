import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ClassManagementProps {
  staff: any;
}

export function ClassManagement({ staff }: ClassManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const classes = useQuery(api.classes.listActiveClasses);
  const teachers = useQuery(api.staff.listActiveTeachers);

  if (classes === undefined || teachers === undefined) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center space-y-4">
          <div className="loading-spinner w-12 h-12 mx-auto"></div>
          <p className="text-gray-600 font-medium">Carregando turmas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 slide-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Gestão de Turmas</h3>
          <p className="text-gray-600 mt-1">Gerencie todas as turmas e modalidades</p>
        </div>
        {(staff.role === "admin" || staff.role === "funcionario") && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="modern-button-primary"
          >
            <span className="mr-2">+</span>
            Nova Turma
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateClassForm 
          teachers={teachers} 
          onClose={() => setShowCreateForm(false)} 
        />
      )}

      {classes.length === 0 ? (
        <div className="modern-card p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-gray-400">🎭</span>
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">Nenhuma turma encontrada</h4>
          <p className="text-gray-600 mb-6">Crie sua primeira turma para começar a gerenciar as aulas</p>
          {(staff.role === "admin" || staff.role === "funcionario") && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="modern-button-primary"
            >
              Criar primeira turma
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div key={classItem._id} className="modern-card p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900">{classItem.modality}</h4>
                <span className="status-active">{classItem.level}</span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600">Tipo:</span>
                  <span className="text-gray-900">{classItem.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600">Duração:</span>
                  <span className="text-gray-900">{classItem.duration} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600">Valor:</span>
                  <span className="font-bold text-emerald-600 text-lg">R$ {classItem.price.toFixed(2)}</span>
                </div>
                {classItem.enrollmentFee && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Taxa de Matrícula:</span>
                    <span className="text-gray-900">R$ {classItem.enrollmentFee.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {classItem.schedule && classItem.schedule.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-3">Horários:</p>
                  <div className="space-y-2">
                    {classItem.schedule.map((schedule: any, index: number) => (
                      <div key={index} className="bg-gray-50 px-3 py-2 rounded-lg text-xs font-medium text-gray-700">
                        <span className="capitalize">{schedule.dayOfWeek}</span>: {schedule.startTime} - {schedule.endTime}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {classItem.teachers && classItem.teachers.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-3">Professores:</p>
                  <div className="space-y-2">
                    {classItem.teachers.map((teacher: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                        <span className="text-xs font-medium text-blue-900">{teacher.teacherName}</span>
                        <span className="text-xs text-blue-600">{teacher.commission}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="status-active">Ativa</span>
                <div className="text-xs text-gray-500">
                  Início: {new Date(classItem.startDate).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateClassForm({ teachers, onClose }: { teachers: any[], onClose: () => void }) {
  const [formData, setFormData] = useState({
    modality: "",
    level: "Básico" as "Básico" | "Intermediário" | "Avançado",
    type: "Regular" as "Regular" | "Workshop" | "Particular" | "Outra",
    startDate: "",
    endDate: "",
    duration: 60,
    price: 0,
    enrollmentFee: 0,
    schedule: [{ dayOfWeek: "segunda" as any, startTime: "", endTime: "" }],
    selectedTeachers: [{ teacherId: "", commission: 0 }],
  });

  const createClass = useMutation(api.classes.createClass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validTeachers = formData.selectedTeachers.filter(t => t.teacherId && t.commission > 0);
      const validSchedule = formData.schedule.filter(s => s.startTime && s.endTime);
      
      if (validTeachers.length === 0) {
        toast.error("Selecione pelo menos um professor");
        return;
      }
      
      if (validSchedule.length === 0) {
        toast.error("Adicione pelo menos um horário");
        return;
      }

      await createClass({
        modality: formData.modality,
        level: formData.level,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        schedule: validSchedule,
        duration: formData.duration,
        price: formData.price,
        enrollmentFee: formData.enrollmentFee > 0 ? formData.enrollmentFee : undefined,
        teachers: validTeachers.map(t => ({ teacherId: t.teacherId as any, commission: t.commission })),
      });
      
      toast.success("Turma criada com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao criar turma: " + (error as Error).message);
    }
  };

  const addSchedule = () => {
    setFormData({
      ...formData,
      schedule: [...formData.schedule, { dayOfWeek: "segunda" as any, startTime: "", endTime: "" }]
    });
  };

  const addTeacher = () => {
    setFormData({
      ...formData,
      selectedTeachers: [...formData.selectedTeachers, { teacherId: "", commission: 0 }]
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Nova Turma</h3>
              <p className="text-gray-600 mt-1">Crie uma nova turma de dança</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
            >
              <span className="text-gray-600 text-xl">✕</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Modalidade</label>
                <input
                  type="text"
                  required
                  value={formData.modality}
                  onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                  className="modern-input"
                  placeholder="Ex: Ballet, Jazz, Hip Hop"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nível</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  className="modern-select"
                >
                  <option value="Básico">Básico</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="modern-select"
                >
                  <option value="Regular">Regular</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Particular">Particular</option>
                  <option value="Outra">Outra</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duração (minutos)</label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Data de Início</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Data de Término (opcional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Valor da Aula (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Taxa de Matrícula (R$) - Opcional</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.enrollmentFee}
                  onChange={(e) => setFormData({ ...formData, enrollmentFee: parseFloat(e.target.value) })}
                  className="modern-input"
                />
              </div>
            </div>

            {/* Horários */}
            <div className="form-group">
              <div className="flex justify-between items-center mb-4">
                <label className="form-label">Horários</label>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  + Adicionar horário
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.schedule.map((schedule, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3">
                    <select
                      value={schedule.dayOfWeek}
                      onChange={(e) => {
                        const newSchedule = [...formData.schedule];
                        newSchedule[index].dayOfWeek = e.target.value as any;
                        setFormData({ ...formData, schedule: newSchedule });
                      }}
                      className="modern-select"
                    >
                      <option value="segunda">Segunda</option>
                      <option value="terça">Terça</option>
                      <option value="quarta">Quarta</option>
                      <option value="quinta">Quinta</option>
                      <option value="sexta">Sexta</option>
                      <option value="sábado">Sábado</option>
                      <option value="domingo">Domingo</option>
                    </select>
                    
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => {
                        const newSchedule = [...formData.schedule];
                        newSchedule[index].startTime = e.target.value;
                        setFormData({ ...formData, schedule: newSchedule });
                      }}
                      className="modern-input"
                    />
                    
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => {
                        const newSchedule = [...formData.schedule];
                        newSchedule[index].endTime = e.target.value;
                        setFormData({ ...formData, schedule: newSchedule });
                      }}
                      className="modern-input"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Professores */}
            <div className="form-group">
              <div className="flex justify-between items-center mb-4">
                <label className="form-label">Professores</label>
                <button
                  type="button"
                  onClick={addTeacher}
                  className="text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  + Adicionar professor
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.selectedTeachers.map((teacher, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3">
                    <select
                      value={teacher.teacherId}
                      onChange={(e) => {
                        const newTeachers = [...formData.selectedTeachers];
                        newTeachers[index].teacherId = e.target.value;
                        setFormData({ ...formData, selectedTeachers: newTeachers });
                      }}
                      className="modern-select"
                    >
                      <option value="">Selecione um professor</option>
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.fullName}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      placeholder="Comissão (%)"
                      value={teacher.commission}
                      onChange={(e) => {
                        const newTeachers = [...formData.selectedTeachers];
                        newTeachers[index].commission = parseFloat(e.target.value);
                        setFormData({ ...formData, selectedTeachers: newTeachers });
                      }}
                      className="modern-input"
                    />
                  </div>
                ))}
              </div>
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
                Criar Turma
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
