import { Category, Course } from "@prisma/client";

import { db } from "@/lib/db";
import { getCourseProgressMap } from "@/actions/get-course-progress-map";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProgress: CourseWithProgressWithCategory[];
}

export const getDashboardCourses = async (userId: string): Promise<DashboardCourses> => {
  try {
    const purchasedCourses = await db.purchase.findMany({
      where: {
        userId: userId,
      },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: {
                isPublished: true,
              },
              select: {
                id: true,
              },
            }
          }
        }
      }
    });

    const courses = purchasedCourses.map((purchase) => purchase.course) as CourseWithProgressWithCategory[];

    const progressMap = await getCourseProgressMap(
      userId,
      courses.map((course) => course.id)
    );

    const coursesWithProgress = courses.map((course) => ({
      ...course,
      progress: progressMap[course.id] ?? 0,
    }));

    const completedCourses = coursesWithProgress.filter((course) => course.progress === 100);
    const coursesInProgress = coursesWithProgress.filter((course) => (course.progress ?? 0) < 100);

    return {
      completedCourses,
      coursesInProgress,
    }
  } catch (error) {
    console.log("[GET_DASHBOARD_COURSES]", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    }
  }
}
