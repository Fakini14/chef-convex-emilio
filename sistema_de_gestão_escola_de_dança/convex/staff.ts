import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Criar perfil de funcionário
export const createStaffProfile = mutation({
  args: {
    fullName: v.string(),
    role: v.union(v.literal("admin"), v.literal("professor"), v.literal("funcionario")),
    email: v.string(),
    whatsapp: v.string(),
    cpf: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se já existe um perfil de funcionário para este usuário
    const existingStaff = await ctx.db
      .query("staff")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingStaff) {
      throw new Error("Perfil de funcionário já existe para este usuário");
    }

    return await ctx.db.insert("staff", {
      userId,
      fullName: args.fullName,
      role: args.role,
      email: args.email,
      whatsapp: args.whatsapp,
      cpf: args.cpf,
      status: "ativo",
    });
  },
});

// Buscar perfil do funcionário logado
export const getMyStaffProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("staff")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Listar professores ativos
export const listActiveTeachers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("staff")
      .withIndex("by_role", (q) => q.eq("role", "professor"))
      .filter((q) => q.eq(q.field("status"), "ativo"))
      .collect();
  },
});

// Listar todos os funcionários
export const listStaff = query({
  args: {
    role: v.optional(v.union(v.literal("admin"), v.literal("professor"), v.literal("funcionario"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se é admin
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!staff || staff.role !== "admin") {
      throw new Error("Acesso negado");
    }

    if (args.role) {
      return await ctx.db
        .query("staff")
        .withIndex("by_role", (q) => q.eq("role", args.role as "admin" | "professor" | "funcionario"))
        .collect();
    }

    return await ctx.db.query("staff").collect();
  },
});
