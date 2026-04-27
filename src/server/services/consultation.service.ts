import { db } from "@/server/db";
import { ConsultationStatus } from "@prisma/client";
import type { BookConsultationInput, CreateConsultationInput, UpdateConsultationInput } from "@/server/validators/consultation";

export async function createConsultation(studentId: string, data: CreateConsultationInput) {
  return db.consultation.create({
    data: {
      ...data,
      studentId,
      status: "pending",
      price: data.price,
    },
  });
}

export async function getConsultationDetail(id: string) {
  return db.consultation.findUnique({
    where: { id },
    include: {
      student: true,
      consultant: true,
    },
  });
}

export async function updateConsultation(id: string, data: UpdateConsultationInput) {
  return db.consultation.update({
    where: { id },
    data,
  });
}

export async function cancelConsultation(id: string) {
  return db.consultation.update({
    where: { id },
    data: { status: "cancelled" },
  });
}

export async function deleteConsultation(id: string) {
  return db.consultation.delete({
    where: { id },
  });
}

export async function listStudentConsultations(studentId: string, page = 1, limit = 20, status?: ConsultationStatus) {
  const skip = (page - 1) * limit;
  
  const [consultations, total] = await Promise.all([
    db.consultation.findMany({
      where: {
        studentId,
        ...(status && { status }),
      },
      include: {
        consultant: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.consultation.count({
      where: {
        studentId,
        ...(status && { status }),
      },
    }),
  ]);

  return {
    consultations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listConsultantConsultations(consultantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [consultations, total] = await Promise.all([
    db.consultation.findMany({
      where: { consultantId },
      include: {
        student: true,
      },
      skip,
      take: limit,
      orderBy: { scheduledAt: "desc" },
    }),
    db.consultation.count({
      where: { consultantId },
    }),
  ]);

  return {
    consultations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getConsultantAvailability(consultantId: string) {
  return db.consultantAvailability.findMany({
    where: { consultantId, isAvailable: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function setConsultantAvailability(consultantId: string, dayOfWeek: number, startTime: string, endTime: string) {
  return db.consultantAvailability.upsert({
    where: {
      consultantId_dayOfWeek_startTime: {
        consultantId,
        dayOfWeek,
        startTime,
      },
    },
    create: {
      consultantId,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable: true,
    },
    update: {
      endTime,
      isAvailable: true,
    },
  });
}
