import { Category, Course } from "@prisma/client";

import { getCourseProgressMap } from "@/actions/get-course-progress-map";
import { db } from "@/lib/db";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
};

export const getCourses = async ({
  userId,
  title,
  categoryId
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
  try {
    const normalizedTitle = title?.trim();

    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        ...(normalizedTitle
          ? {
              title: {
                contains: normalizedTitle,
                mode: "insensitive",
              },
            }
          : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
          }
        },
        purchases: {
          where: {
            userId,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    const purchasedCourseIds = courses
      .filter((course) => course.purchases.length > 0)
      .map((course) => course.id);

    const progressMap = await getCourseProgressMap(userId, purchasedCourseIds);

    const coursesWithProgress: CourseWithProgressWithCategory[] = courses.map(
      (course) => {
        if (course.purchases.length === 0) {
          return {
            ...course,
            progress: null,
          };
        }

        return {
          ...course,
          progress: progressMap[course.id] ?? 0,
        };
      }
    );

    return coursesWithProgress;
  } catch (error) {
    console.log("[GET_COURSES]", error);
    return [];
  }
}
