import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Tabela de alunos
  students: defineTable({
    userId: v.id("users"), // Referência ao usuário autenticado
    fullName: v.string(),
    cpf: v.string(),
    whatsapp: v.string(),
    email: v.string(),
    partnerId: v.optional(v.id("students")), // Parceiro/dependente
    gender: v.union(v.literal("masculino"), v.literal("feminino"), v.literal("outro")),
    status: v.union(v.literal("ativo"), v.literal("inativo")),
  })
    .index("by_user", ["userId"])
    .index("by_cpf", ["cpf"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // Tabela de funcionários (professores, admin, funcionários)
  staff: defineTable({
    userId: v.id("users"), // Referência ao usuário autenticado
    fullName: v.string(),
    role: v.union(v.literal("admin"), v.literal("professor"), v.literal("funcionario")),
    email: v.string(),
    whatsapp: v.string(),
    cpf: v.string(),
    status: v.union(v.literal("ativo"), v.literal("inativo")),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"])
    .index("by_status", ["status"])
    .index("by_cpf", ["cpf"]),

  // Tabela de turmas
  classes: defineTable({
    modality: v.string(), // Modalidade/estilo da dança
    level: v.union(v.literal("Básico"), v.literal("Intermediário"), v.literal("Avançado")),
    type: v.union(v.literal("Regular"), v.literal("Workshop"), v.literal("Particular"), v.literal("Outra")),
    startDate: v.string(), // Data de início
    endDate: v.optional(v.string()), // Data de término (opcional)
    schedule: v.array(v.object({
      dayOfWeek: v.union(
        v.literal("segunda"),
        v.literal("terça"),
        v.literal("quarta"),
        v.literal("quinta"),
        v.literal("sexta"),
        v.literal("sábado"),
        v.literal("domingo")
      ),
      startTime: v.string(), // HH:MM
      endTime: v.string(), // HH:MM
    })),
    duration: v.number(), // Duração em minutos
    price: v.number(), // Valor da aula
    enrollmentFee: v.optional(v.number()), // Taxa de matrícula (opcional)
    status: v.union(v.literal("ativa"), v.literal("inativa")),
  })
    .index("by_modality", ["modality"])
    .index("by_level", ["level"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Tabela de professores por turma (relacionamento)
  classTeachers: defineTable({
    classId: v.id("classes"),
    teacherId: v.id("staff"),
    commission: v.number(), // Comissão do professor (%)
  })
    .index("by_class", ["classId"])
    .index("by_teacher", ["teacherId"]),

  // Tabela de matrículas (relacionamento aluno-turma)
  enrollments: defineTable({
    studentId: v.id("students"),
    classId: v.id("classes"),
    enrollmentDate: v.string(),
    status: v.union(v.literal("ativa"), v.literal("cancelada"), v.literal("suspensa")),
    paymentStatus: v.union(v.literal("pendente"), v.literal("pago"), v.literal("atrasado")),
  })
    .index("by_student", ["studentId"])
    .index("by_class", ["classId"])
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
