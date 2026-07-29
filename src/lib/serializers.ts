import { toDateStr } from './dates.js';
import type {
  BodyMeasurement,
  Member,
  ProgressPhoto,
  Trainer,
  WeightEntry,
} from '@prisma/client';

type MemberWithRelations = Member & {
  weightHistory: WeightEntry[];
  bodyMeasurements: BodyMeasurement[];
  progressPhotos: ProgressPhoto[];
};

export function serializeMember(m: MemberWithRelations) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    avatar: m.avatar,
    plan: m.plan,
    status: m.status,
    joinDate: toDateStr(m.joinDate),
    nextPaymentDate: toDateStr(m.nextPaymentDate),
    monthlyFee: m.monthlyFee,
    checkIns: m.checkInCount,
    trainerId: m.trainerId ?? '',
    currentStreakDays: m.currentStreakDays,
    weightGoalKg: m.weightGoalKg,
    weightHistory: m.weightHistory
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((w) => ({ date: toDateStr(w.date), weightKg: w.weightKg })),
    emergencyContact: {
      name: m.emergencyContactName,
      phone: m.emergencyContactPhone,
      relationship: m.emergencyContactRelationship,
    },
    bodyMeasurements: m.bodyMeasurements
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((b) => ({
        date: toDateStr(b.date),
        bodyFatPercent: b.bodyFatPercent,
        waistCm: b.waistCm,
        chestCm: b.chestCm,
        armCm: b.armCm,
      })),
    progressPhotos: m.progressPhotos
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((p) => ({ date: toDateStr(p.date), url: p.url, note: p.note ?? undefined })),
    freezeRequest: m.freezeReason
      ? { reason: m.freezeReason, requestedAt: toDateStr(m.freezeRequestedAt!) }
      : null,
  };
}

export const memberInclude = {
  weightHistory: true,
  bodyMeasurements: true,
  progressPhotos: true,
} as const;

export function serializeTrainer(t: Trainer, activeStudents: number) {
  return {
    id: t.id,
    name: t.name,
    email: t.email,
    avatar: t.avatar,
    specialty: t.specialty,
    bio: t.bio,
    activeStudents,
  };
}
