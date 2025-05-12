import { prisma } from '../lib/prisma'

/* ✅ Get all students enrolled in a specific course */
export async function getStudentsByCourse(courseId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });

  return enrollments.map(e => e.student);
}

/* ✅ Create a new student */
export async function createStudent(data: { name: string; email: string }) {
  return await prisma.student.create({
    data
  });
}

/* ✅ Get students sorted by GPA */
export async function getTopStudents(limit: number = 10) {
  return await prisma.student.findMany({
    orderBy: { gpa: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      gpa: true,
    }
  });
}
