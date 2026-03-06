import { db } from "@/lib/db";

export const getCourseProgressMap = async (
  userId: string,
  courseIds: string[]
): Promise<Record<string, number>> => {
  const uniqueCourseIds = Array.from(new Set(courseIds));

  if (!uniqueCourseIds.length) {
    return {};
  }

  const publishedChapters = await db.chapter.findMany({
    where: {
      isPublished: true,
      courseId: {
        in: uniqueCourseIds,
      },
    },
    select: {
      id: true,
      courseId: true,
    },
  });

  const chapterToCourse = new Map(
    publishedChapters.map((chapter) => [chapter.id, chapter.courseId])
  );

  const totalByCourse: Record<string, number> = {};
  for (const chapter of publishedChapters) {
    totalByCourse[chapter.courseId] = (totalByCourse[chapter.courseId] || 0) + 1;
  }

  const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

  const completedProgress = publishedChapterIds.length
    ? await db.userProgress.findMany({
        where: {
          userId,
          isCompleted: true,
          chapterId: {
            in: publishedChapterIds,
          },
        },
        select: {
          chapterId: true,
        },
      })
    : [];

  const completedByCourse: Record<string, number> = {};
  for (const progress of completedProgress) {
    const courseId = chapterToCourse.get(progress.chapterId);
    if (!courseId) {
      continue;
    }

    completedByCourse[courseId] = (completedByCourse[courseId] || 0) + 1;
  }

  const progressMap: Record<string, number> = {};
  for (const courseId of uniqueCourseIds) {
    const total = totalByCourse[courseId] || 0;
    const completed = completedByCourse[courseId] || 0;

    progressMap[courseId] = total === 0 ? 0 : (completed / total) * 100;
  }

  return progressMap;
};

