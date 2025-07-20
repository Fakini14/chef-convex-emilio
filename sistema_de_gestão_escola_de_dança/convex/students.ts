import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Criar perfil de aluno
export const createStudentProfile = mutation({
  args: {
    fullName: v.string(),
    cpf: v.string(),
    whatsapp: v.string(),
    email: v.string(),
    partnerId: v.optional(v.id("students")),
    gender: v.union(v.literal("masculino"), v.literal("feminino"), v.literal("outro")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se já existe um perfil de aluno para este usuário
    const existingStudent = await ctx.db
      .query("students")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingStudent) {
      throw new Error("Perfil de aluno já existe para este usuário");
    }

    return await ctx.db.insert("students", {
      userId,
      fullName: args.fullName,
      cpf: args.cpf,
      whatsapp: args.whatsapp,
      email: args.email,
      partnerId: args.partnerId,
      gender: args.gender,
      status: "ativo",
    });
  },
});

// Buscar perfil do aluno logado
export const getMyStudentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("students")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Listar todos os alunos (para funcionários)
export const listStudents = query({
  args: {
    status: v.optional(v.union(v.literal("ativo"), v.literal("inativo"))),
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

    if (args.status) {
      return await ctx.db
        .query("students")
        .withIndex("by_status", (q) => q.eq("status", args.status as "ativo" | "inativo"))
        .collect();
    }

    return await ctx.db.query("students").collect();
  },
});

// Atualizar status do aluno
export const updateStudentStatus = mutation({
  args: {
    studentId: v.id("students"),
    status: v.union(v.literal("ativo"), v.literal("inativo")),
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

    return await ctx.db.patch(args.studentId, {
      status: args.status,
    });
  },
});
