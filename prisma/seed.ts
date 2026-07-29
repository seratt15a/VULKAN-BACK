import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'vulkan2026';

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---- Trainers ----
  const trainers = [
    {
      id: 't1',
      name: 'Marco Díaz',
      email: 'marco.diaz@vulkangym.com',
      avatar: 'https://images.unsplash.com/photo-1758875568932-0eefd3e60090?auto=format&fit=crop&w=200&q=80',
      specialty: 'Fuerza & Powerlifting',
      bio: 'Especialista en sentadilla, press y peso muerto. 10 años formando levantadores.',
    },
    {
      id: 't2',
      name: 'Valeria Ruiz',
      email: 'valeria.ruiz@vulkangym.com',
      avatar: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=200&q=80',
      specialty: 'HIIT & Funcional',
      bio: 'Rutinas de alta intensidad enfocadas en resistencia y quema de grasa.',
    },
    {
      id: 't3',
      name: 'Diego Torres',
      email: 'diego.torres@vulkangym.com',
      avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=200&q=80',
      specialty: 'Hipertrofia & Musculación',
      bio: 'Programación de volumen progresivo para ganancia de masa muscular.',
    },
    {
      id: 't4',
      name: 'Camila Soto',
      email: 'camila.soto@vulkangym.com',
      avatar: 'https://images.unsplash.com/photo-1708011108776-45ad9e625269?auto=format&fit=crop&w=200&q=80',
      specialty: 'Movilidad & Yoga',
      bio: 'Sesiones de movilidad, estiramiento y recuperación activa.',
    },
  ];
  for (const t of trainers) {
    await prisma.trainer.upsert({ where: { id: t.id }, update: {}, create: t });
  }

  // ---- Members ----
  const members = [
    {
      id: 'm1',
      name: 'Andrés Reyes',
      email: 'andres.reyes@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80',
      plan: 'Pro',
      status: 'activa',
      joinDate: d('2023-02-10'),
      nextPaymentDate: d('2026-08-05'),
      monthlyFee: 49,
      checkInCount: 128,
      trainerId: 't1',
      currentStreakDays: 12,
      weightGoalKg: 82,
      emergencyContactName: 'Marta Reyes',
      emergencyContactPhone: '+52 55 2233 4455',
      emergencyContactRelationship: 'Esposa',
      weightHistory: [
        { date: d('2026-02-01'), weightKg: 92 },
        { date: d('2026-03-01'), weightKg: 90.5 },
        { date: d('2026-04-01'), weightKg: 89 },
        { date: d('2026-05-01'), weightKg: 87.5 },
        { date: d('2026-06-01'), weightKg: 86 },
        { date: d('2026-07-01'), weightKg: 85 },
      ],
      bodyMeasurements: [
        { date: d('2026-05-01'), bodyFatPercent: 24, waistCm: 95, chestCm: 104, armCm: 35 },
        { date: d('2026-07-01'), bodyFatPercent: 21, waistCm: 91, chestCm: 105, armCm: 36 },
      ],
      progressPhotos: [
        { date: d('2026-07-01'), url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80', note: 'Progreso mes 5' },
      ],
    },
    {
      id: 'm2',
      name: 'Laura Méndez',
      email: 'laura.mendez@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      plan: 'Élite',
      status: 'activa',
      joinDate: d('2022-06-01'),
      nextPaymentDate: d('2026-07-28'),
      monthlyFee: 89,
      checkInCount: 302,
      trainerId: 't2',
      currentStreakDays: 34,
      weightGoalKg: 60,
      emergencyContactName: 'Diego Méndez',
      emergencyContactPhone: '+52 55 3344 5566',
      emergencyContactRelationship: 'Hermano',
      weightHistory: [
        { date: d('2026-02-01'), weightKg: 54 },
        { date: d('2026-03-01'), weightKg: 55 },
        { date: d('2026-04-01'), weightKg: 56.2 },
        { date: d('2026-05-01'), weightKg: 57 },
        { date: d('2026-06-01'), weightKg: 58 },
        { date: d('2026-07-01'), weightKg: 59 },
      ],
      bodyMeasurements: [
        { date: d('2026-05-01'), bodyFatPercent: 22, waistCm: 70, chestCm: 88, armCm: 27 },
        { date: d('2026-07-01'), bodyFatPercent: 20, waistCm: 68, chestCm: 90, armCm: 28 },
      ],
      progressPhotos: [],
    },
    {
      id: 'm3',
      name: 'Jorge Salinas',
      email: 'jorge.salinas@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      plan: 'Básico',
      status: 'pausada',
      joinDate: d('2024-01-15'),
      nextPaymentDate: d('2026-07-30'),
      monthlyFee: 29,
      checkInCount: 47,
      trainerId: 't3',
      currentStreakDays: 0,
      weightGoalKg: 75,
      emergencyContactName: 'Ana Salinas',
      emergencyContactPhone: '+52 55 4455 6677',
      emergencyContactRelationship: 'Esposa',
      weightHistory: [
        { date: d('2026-02-01'), weightKg: 78 },
        { date: d('2026-03-01'), weightKg: 77.5 },
        { date: d('2026-04-01'), weightKg: 78 },
        { date: d('2026-05-01'), weightKg: 77 },
        { date: d('2026-06-01'), weightKg: 76.5 },
        { date: d('2026-07-01'), weightKg: 77 },
      ],
      bodyMeasurements: [],
      progressPhotos: [],
    },
    {
      id: 'm4',
      name: 'Sofía Navarro',
      email: 'sofia.navarro@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      plan: 'Pro',
      status: 'vencida',
      joinDate: d('2023-09-20'),
      nextPaymentDate: d('2026-07-10'),
      monthlyFee: 49,
      checkInCount: 96,
      trainerId: 't1',
      currentStreakDays: 0,
      weightGoalKg: 65,
      emergencyContactName: 'Luis Navarro',
      emergencyContactPhone: '+52 55 5566 7788',
      emergencyContactRelationship: 'Padre',
      weightHistory: [
        { date: d('2026-02-01'), weightKg: 70 },
        { date: d('2026-03-01'), weightKg: 69 },
        { date: d('2026-04-01'), weightKg: 68.5 },
        { date: d('2026-05-01'), weightKg: 69 },
        { date: d('2026-06-01'), weightKg: 70 },
        { date: d('2026-07-01'), weightKg: 71 },
      ],
      bodyMeasurements: [],
      progressPhotos: [],
    },
    {
      id: 'm5',
      name: 'Ricardo Palma',
      email: 'ricardo.palma@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=200&q=80',
      plan: 'Básico',
      status: 'activa',
      joinDate: d('2025-03-11'),
      nextPaymentDate: d('2026-08-01'),
      monthlyFee: 29,
      checkInCount: 22,
      trainerId: 't2',
      currentStreakDays: 5,
      weightGoalKg: 80,
      emergencyContactName: 'Elena Palma',
      emergencyContactPhone: '+52 55 6677 8899',
      emergencyContactRelationship: 'Madre',
      weightHistory: [
        { date: d('2026-05-01'), weightKg: 88 },
        { date: d('2026-06-01'), weightKg: 86.2 },
        { date: d('2026-07-01'), weightKg: 84.5 },
      ],
      bodyMeasurements: [],
      progressPhotos: [],
      freezeReason: 'Viaje de trabajo, vuelvo en 2 semanas.',
      freezeRequestedAt: d('2026-07-20'),
    },
    {
      id: 'm6',
      name: 'Daniela Cruz',
      email: 'daniela.cruz@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      plan: 'Élite',
      status: 'activa',
      joinDate: d('2021-11-05'),
      nextPaymentDate: d('2026-08-03'),
      monthlyFee: 89,
      checkInCount: 410,
      trainerId: 't3',
      currentStreakDays: 61,
      weightGoalKg: 58,
      emergencyContactName: 'Marcos Cruz',
      emergencyContactPhone: '+52 55 7788 9900',
      emergencyContactRelationship: 'Esposo',
      weightHistory: [
        { date: d('2026-02-01'), weightKg: 62 },
        { date: d('2026-03-01'), weightKg: 61 },
        { date: d('2026-04-01'), weightKg: 60.4 },
        { date: d('2026-05-01'), weightKg: 59.5 },
        { date: d('2026-06-01'), weightKg: 59 },
        { date: d('2026-07-01'), weightKg: 58.4 },
      ],
      bodyMeasurements: [
        { date: d('2026-05-01'), bodyFatPercent: 19, waistCm: 65, chestCm: 86, armCm: 26 },
        { date: d('2026-07-01'), bodyFatPercent: 18, waistCm: 64, chestCm: 87, armCm: 27 },
      ],
      progressPhotos: [
        { date: d('2026-06-01'), url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80' },
      ],
    },
  ];

  for (const { weightHistory, bodyMeasurements, progressPhotos, ...m } of members) {
    await prisma.member.upsert({
      where: { id: m.id },
      update: {},
      create: {
        ...m,
        weightHistory: { create: weightHistory },
        bodyMeasurements: { create: bodyMeasurements },
        progressPhotos: { create: progressPhotos },
      },
    });
  }

  // ---- Users (auth accounts) ----
  await prisma.user.upsert({
    where: { email: 'admin@vulkangym.com' },
    update: {},
    create: {
      email: 'admin@vulkangym.com',
      passwordHash,
      role: 'ADMIN',
      name: 'Staff VULKAN',
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80',
    },
  });
  await prisma.user.upsert({
    where: { email: 'recepcion@vulkangym.com' },
    update: {},
    create: {
      email: 'recepcion@vulkangym.com',
      passwordHash,
      role: 'RECEPTION',
      name: 'Recepción VULKAN',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    },
  });
  for (const m of members) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: { email: m.email, passwordHash, role: 'MEMBER', memberId: m.id },
    });
  }
  for (const t of trainers) {
    await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { email: t.email, passwordHash, role: 'TRAINER', trainerId: t.id },
    });
  }

  // ---- Classes + bookings ----
  const classes = [
    { id: 'c1', name: 'Fuerza Base', category: 'Fuerza', trainerId: 't1', day: 'Lun', startTime: '07:00', durationMin: 60, capacity: 12, bookedIds: ['m1', 'm2', 'm5'], waitlistIds: [], attendedIds: ['m1', 'm2'] },
    { id: 'c2', name: 'Powerlifting Avanzado', category: 'Fuerza', trainerId: 't1', day: 'Mié', startTime: '18:00', durationMin: 75, capacity: 2, bookedIds: ['m1', 'm4'], waitlistIds: ['m6'], attendedIds: [] },
    { id: 'c3', name: 'HIIT Quema Total', category: 'HIIT', trainerId: 't2', day: 'Mar', startTime: '06:30', durationMin: 45, capacity: 16, bookedIds: ['m2', 'm3', 'm5', 'm6'], waitlistIds: [], attendedIds: [] },
    { id: 'c4', name: 'Funcional Explosivo', category: 'HIIT', trainerId: 't2', day: 'Jue', startTime: '19:00', durationMin: 50, capacity: 16, bookedIds: ['m1'], waitlistIds: [], attendedIds: [] },
    { id: 'c5', name: 'Hipertrofia Piernas', category: 'Hipertrofia', trainerId: 't3', day: 'Lun', startTime: '17:00', durationMin: 60, capacity: 12, bookedIds: ['m2', 'm4', 'm6'], waitlistIds: [], attendedIds: [] },
    { id: 'c6', name: 'Hipertrofia Torso', category: 'Hipertrofia', trainerId: 't3', day: 'Vie', startTime: '17:00', durationMin: 60, capacity: 12, bookedIds: [], waitlistIds: [], attendedIds: [] },
    { id: 'c7', name: 'Movilidad & Recuperación', category: 'Movilidad', trainerId: 't4', day: 'Mié', startTime: '08:00', durationMin: 45, capacity: 20, bookedIds: ['m3', 'm5'], waitlistIds: [], attendedIds: [] },
    { id: 'c8', name: 'Yoga Flow', category: 'Movilidad', trainerId: 't4', day: 'Sáb', startTime: '09:00', durationMin: 60, capacity: 20, bookedIds: ['m2', 'm6'], waitlistIds: [], attendedIds: [] },
    { id: 'c9', name: 'Cardio Boxing', category: 'Cardio', trainerId: 't2', day: 'Sáb', startTime: '10:30', durationMin: 45, capacity: 18, bookedIds: ['m1', 'm3'], waitlistIds: [], attendedIds: [] },
  ];

  for (const { bookedIds, waitlistIds, attendedIds, ...c } of classes) {
    await prisma.gymClass.upsert({ where: { id: c.id }, update: {}, create: c });
    for (const memberId of bookedIds) {
      await prisma.classBooking.upsert({
        where: { classId_memberId: { classId: c.id, memberId } },
        update: {},
        create: { classId: c.id, memberId, status: 'BOOKED', attended: attendedIds.includes(memberId) },
      });
    }
    for (const memberId of waitlistIds) {
      await prisma.classBooking.upsert({
        where: { classId_memberId: { classId: c.id, memberId } },
        update: {},
        create: { classId: c.id, memberId, status: 'WAITLISTED' },
      });
    }
  }

  // ---- Payments ----
  const payments = [
    { id: 'p1', memberId: 'm1', amount: 49, date: '2026-07-05', plan: 'Pro', status: 'pagado' },
    { id: 'p2', memberId: 'm2', amount: 89, date: '2026-06-28', plan: 'Élite', status: 'pagado' },
    { id: 'p3', memberId: 'm3', amount: 29, date: '2026-06-30', plan: 'Básico', status: 'pendiente' },
    { id: 'p4', memberId: 'm4', amount: 49, date: '2026-06-10', plan: 'Pro', status: 'vencido' },
    { id: 'p5', memberId: 'm5', amount: 29, date: '2026-07-01', plan: 'Básico', status: 'pagado' },
    { id: 'p6', memberId: 'm6', amount: 89, date: '2026-07-03', plan: 'Élite', status: 'pagado' },
    { id: 'p7', memberId: 'm1', amount: 49, date: '2026-06-05', plan: 'Pro', status: 'pagado' },
    { id: 'p8', memberId: 'm2', amount: 89, date: '2026-05-28', plan: 'Élite', status: 'pagado' },
    { id: 'p9', memberId: 'm1', amount: 49, date: '2026-05-05', plan: 'Pro', status: 'pagado' },
    { id: 'p10', memberId: 'm6', amount: 89, date: '2026-05-03', plan: 'Élite', status: 'pagado' },
    { id: 'p11', memberId: 'm3', amount: 29, date: '2026-05-15', plan: 'Básico', status: 'pagado' },
    { id: 'p12', memberId: 'm1', amount: 49, date: '2026-04-05', plan: 'Pro', status: 'pagado' },
    { id: 'p13', memberId: 'm2', amount: 89, date: '2026-04-28', plan: 'Élite', status: 'pagado' },
    { id: 'p14', memberId: 'm6', amount: 89, date: '2026-04-03', plan: 'Élite', status: 'pagado' },
    { id: 'p15', memberId: 'm4', amount: 49, date: '2026-04-20', plan: 'Pro', status: 'pagado' },
    { id: 'p16', memberId: 'm1', amount: 49, date: '2026-03-05', plan: 'Pro', status: 'pagado' },
    { id: 'p17', memberId: 'm2', amount: 89, date: '2026-03-28', plan: 'Élite', status: 'pagado' },
    { id: 'p18', memberId: 'm6', amount: 89, date: '2026-03-03', plan: 'Élite', status: 'pagado' },
  ];
  for (const { date, ...p } of payments) {
    await prisma.payment.upsert({ where: { id: p.id }, update: {}, create: { ...p, date: d(date) } });
  }

  // ---- Workout plans ----
  await prisma.workoutPlan.upsert({
    where: { id: 'wp1' },
    update: {},
    create: {
      id: 'wp1',
      memberId: 'm1',
      trainerId: 't1',
      title: 'Fuerza — Bloque 3',
      createdAt: d('2026-07-01'),
      exercises: {
        create: [
          { name: 'Sentadilla trasera', libraryKey: 'squat-back', sets: 5, reps: '5', notes: 'Subir 2.5 kg respecto a la semana pasada', position: 0 },
          { name: 'Press banca', libraryKey: 'bench-press', sets: 4, reps: '6', position: 1 },
          { name: 'Peso muerto rumano', libraryKey: 'deadlift-rdl', sets: 3, reps: '8', position: 2 },
          { name: 'Remo con barra', libraryKey: 'barbell-row', sets: 3, reps: '10', position: 3 },
        ],
      },
    },
  });
  await prisma.workoutPlan.upsert({
    where: { id: 'wp2' },
    update: {},
    create: {
      id: 'wp2',
      memberId: 'm6',
      trainerId: 't3',
      title: 'Hipertrofia — Fase de definición',
      createdAt: d('2026-06-15'),
      exercises: {
        create: [
          { name: 'Press inclinado mancuernas', libraryKey: 'incline-press', sets: 4, reps: '10-12', position: 0 },
          { name: 'Extensión de cuádriceps', libraryKey: 'leg-extension', sets: 4, reps: '12', position: 1 },
          { name: 'Curl de bíceps', libraryKey: 'bicep-curl', sets: 3, reps: '12', notes: 'Tempo lento en la fase excéntrica', position: 2 },
          { name: 'Elevaciones laterales', libraryKey: 'lateral-raise', sets: 3, reps: '15', position: 3 },
        ],
      },
    },
  });

  // ---- Session packages ----
  await prisma.sessionPackage.upsert({
    where: { id: 'pkg1' },
    update: {},
    create: { id: 'pkg1', memberId: 'm6', totalSessions: 10, usedSessions: 3, purchaseDate: d('2026-06-01'), expirationDate: d('2026-09-01'), price: 450 },
  });
  await prisma.sessionPackage.upsert({
    where: { id: 'pkg2' },
    update: {},
    create: { id: 'pkg2', memberId: 'm5', totalSessions: 5, usedSessions: 5, purchaseDate: d('2026-05-10'), expirationDate: d('2026-08-10'), price: 250 },
  });

  console.log('Seed completo: 4 entrenadores, 6 miembros, 9 clases, 18 pagos, 2 rutinas, 2 paquetes.');
  console.log(`Contraseña de todas las cuentas de prueba: ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
