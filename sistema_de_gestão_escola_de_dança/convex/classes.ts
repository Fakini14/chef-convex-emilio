import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Criar nova turma
export const createClass = mutation({
  args: {
    modality: v.string(),
    level: v.union(v.literal("Básico"), v.literal("Intermediário"), v.literal("Avançado")),
    type: v.union(v.literal("Regular"), v.literal("Workshop"), v.literal("Particular"), v.literal("Outra")),
    startDate: v.string(),
    endDate: v.optional(v.string()),
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
      startTime: v.string(),
      endTime: v.string(),
    })),
    duration: v.number(),
    price: v.number(),
    enrollmentFee: v.optional(v.number()),
    teachers: v.array(v.object({
      teacherId: v.id("staff"),
      commission: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se é funcionário ou admin
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!staff || (staff.role !== "admin" && staff.role !== "funcionario")) {
      throw new Error("Acesso negado");
    }

    // Criar a turma
    const classId = await ctx.db.insert("classes", {
      modality: args.modality,
      level: args.level,
      type: args.type,
      startDate: args.startDate,
      endDate: args.endDate,
      schedule: args.schedule,
      duration: args.duration,
      price: args.price,
      enrollmentFee: args.enrollmentFee,
      status: "ativa",
    });

    // Associar professores à turma
    for (const teacher of args.teachers) {
      await ctx.db.insert("classTeachers", {
        classId,
        teacherId: teacher.teacherId,
        commission: teacher.commission,
      });
    }

    return classId;
  },
});

// Listar turmas ativas
export const listActiveClasses = query({
  args: {},
  handler: async (ctx) => {
    const classes = await ctx.db
      .query("classes")
      .withIndex("by_status", (q) => q.eq("status", "ativa"))
      .collect();

    // Buscar professores para cada turma
    const classesWithTeachers = await Promise.all(
      classes.map(async (classItem) => {
        const teachers = await ctx.db
          .query("classTeachers")
          .withIndex("by_class", (q) => q.eq("classId", classItem._id))
          .collect();

        const teachersWithDetails = await Promise.all(
          teachers.map(async (teacher) => {
            const teacherDetails = await ctx.db.get(teacher.teacherId);
            return {
              ...teacher,
              teacherName: teacherDetails?.fullName || "Professor não encontrado",
            };
          })
        );

        return {
          ...classItem,
          teachers: teachersWithDetails,
        };
      })
    );

    return classesWithTeachers;
  },
});

// Buscar turma por ID com detalhes
export const getClassById = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const classItem = await ctx.db.get(args.classId);
    if (!classItem) {
      return null;
    }

    // Buscar professores da turma
    const teachers = await ctx.db
      .query("classTeachers")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();

    const teachersWithDetails = await Promise.all(
      teachers.map(async (teacher) => {
        const teacherDetails = await ctx.db.get(teacher.teacherId);
        return {
          ...teacher,
          teacherName: teacherDetails?.fullName || "Professor não encontrado",
        };
      })
    );

    return {
      ...classItem,
      teachers: teachersWithDetails,
    };
  },
});
