import { prisma } from '../lib/prisma';

/*get top 3 most taken courses */
export async function getMostPopularCourses() {
  return await prisma.course.findMany({
    orderBy: {
      students: {
        _count: 'desc'
      }
    },
    take: 3,
    select: {
      id: true,
      title: true,
      _count: {
        select: { students: true }
      }
    }
  });
}


/*count students per course category */
export async function countStudentsByCategory() {
  return await prisma.course.groupBy({
    by: ['category'],
    _count: { students: true }
  });
}
