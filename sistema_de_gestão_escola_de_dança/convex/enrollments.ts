import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Matricular aluno em turma
export const enrollStudent = mutation({
  args: {
    studentId: v.id("students"),
    classId: v.id("classes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se é funcionário
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!staff) {
      throw new Error("Acesso negado");
    }

    // Verificar se já existe matrícula ativa
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("classId"), args.classId))
      .filter((q) => q.eq(q.field("status"), "ativa"))
      .first();

    if (existingEnrollment) {
      throw new Error("Aluno já está matriculado nesta turma");
    }

    return await ctx.db.insert("enrollments", {
      studentId: args.studentId,
      classId: args.classId,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: "ativa",
      paymentStatus: "pendente",
    });
  },
});

// Buscar matrículas do aluno logado
export const getMyEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Buscar perfil do aluno
    const student = await ctx.db
      .query("students")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!student) {
      return [];
    }

    // Buscar matrículas ativas
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .filter((q) => q.eq(q.field("status"), "ativa"))
      .collect();

    // Buscar detalhes das turmas
    const enrollmentsWithClasses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const classItem = await ctx.db.get(enrollment.classId);
        return {
          ...enrollment,
          class: classItem,
        };
      })
    );

    return enrollmentsWithClasses;
  },
});

// Listar matrículas por turma
export const getEnrollmentsByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se é funcionário
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!staff) {
      throw new Error("Acesso negado");
    }

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();

    // Buscar detalhes dos alunos
    const enrollmentsWithStudents = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await ctx.db.get(enrollment.studentId);
        return {
          ...enrollment,
          student,
        };
      })
    );

    return enrollmentsWithStudents;
  },
});

// Cancelar matrícula
export const cancelEnrollment = mutation({
  args: { enrollmentId: v.id("enrollments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se é funcionário
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!staff) {
      throw new Error("Acesso negado");
    }

    return await ctx.db.patch(args.enrollmentId, {
      status: "cancelada",
    });
  },
});
