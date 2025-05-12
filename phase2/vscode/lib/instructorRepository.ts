import { prisma } from '../lib/prisma'

/** Get all instructors with number of courses they teach */
export async function getInstructorCourseCounts() {
  return await prisma.instructor.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { courses: true }
      }
    }
  });
}
