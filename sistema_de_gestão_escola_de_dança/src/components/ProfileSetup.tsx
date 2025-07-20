import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [profileType, setProfileType] = useState<"student" | "staff" | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    cpf: "",
    whatsapp: "",
    email: "",
    gender: "masculino" as "masculino" | "feminino" | "outro",
    role: "funcionario" as "admin" | "professor" | "funcionario",
  });

  const createStudentProfile = useMutation(api.students.createStudentProfile);
  const createStaffProfile = useMutation(api.staff.createStaffProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (profileType === "student") {
        await createStudentProfile({
          fullName: formData.fullName,
          cpf: formData.cpf,
          whatsapp: formData.whatsapp,
          email: formData.email,
          gender: formData.gender,
        });
        toast.success("Perfil de aluno criado com sucesso!");
      } else if (profileType === "staff") {
        await createStaffProfile({
          fullName: formData.fullName,
          role: formData.role,
          email: formData.email,
          whatsapp: formData.whatsapp,
          cpf: formData.cpf,
        });
        toast.success("Perfil de funcionário criado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao criar perfil: " + (error as Error).message);
    }
  };

  if (!profileType) {
    return (
      <div className="max-w-md mx-auto fade-in">
        <div className="modern-card p-8 slide-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">⚙️</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Configurar Perfil
            </h2>
            <p className="text-gray-600">Selecione o tipo de perfil que deseja criar</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setProfileType("student")}
              className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 text-left group hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">👨‍🎓</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Aluno</h3>
                  <p className="text-sm text-gray-600">
                    Acesse suas turmas e informações pessoais
                  </p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setProfileType("staff")}
              className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 text-left group hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">👨‍💼</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Funcionário</h3>
                  <p className="text-sm text-gray-600">
                    Gerencie turmas, alunos e matrículas
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto fade-in">
      <div className="modern-card p-8 slide-up">
        <div className="flex items-center mb-8">
          <button
            onClick={() => setProfileType(null)}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center mr-4 transition-colors duration-200"
          >
            <span className="text-gray-600">←</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profileType === "student" ? "Perfil do Aluno" : "Perfil do Funcionário"}
            </h2>
            <p className="text-gray-600 text-sm mt-1">Preencha suas informações</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="modern-input"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="form-group">
            <label className="form-label">CPF</label>
            <input
              type="text"
              required
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              className="modern-input"
              placeholder="000.000.000-00"
            />
          </div>

          <div className="form-group">
            <label className="form-label">WhatsApp</label>
            <input
              type="text"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="modern-input"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="modern-input"
              placeholder="seu@email.com"
            />
          </div>

          {profileType === "student" && (
            <div className="form-group">
              <label className="form-label">Sexo</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="modern-select"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          )}

          {profileType === "staff" && (
            <div className="form-group">
              <label className="form-label">Função</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="modern-select"
              >
                <option value="funcionario">Funcionário</option>
                <option value="professor">Professor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
          >
            Criar Perfil
          </button>
        </form>
      </div>
    </div>
  );
}
