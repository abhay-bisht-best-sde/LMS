import { db } from "@/lib/db";
import { Attachment, Chapter } from "@prisma/client";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
};

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {
  try {
    const [purchase, course, chapter, userProgress] = await Promise.all([
      db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          }
        }
      }),
      db.course.findUnique({
        where: {
          isPublished: true,
          id: courseId,
        },
        select: {
          price: true,
        }
      }),
      db.chapter.findUnique({
        where: {
          id: chapterId,
          isPublished: true,
        }
      }),
      db.userProgress.findUnique({
        where: {
          userId_chapterId: {
            userId,
            chapterId,
          }
        }
      })
    ]);

    if (!chapter || !course) {
      throw new Error("Chapter or course not found");
    }

    const attachmentsPromise: Promise<Attachment[]> = purchase
      ? db.attachment.findMany({
          where: {
            courseId,
          }
        })
      : Promise.resolve([]);

    const chapterAccessDataPromise: Promise<{
      muxData: Awaited<ReturnType<typeof db.muxData.findUnique>>;
      nextChapter: Chapter | null;
    }> = chapter.isFree || purchase
      ? Promise.all([
          db.muxData.findUnique({
            where: {
              chapterId,
            }
          }),
          db.chapter.findFirst({
            where: {
              courseId,
              isPublished: true,
              position: {
                gt: chapter.position,
              }
            },
            orderBy: {
              position: "asc",
            }
          })
        ]).then(([muxData, nextChapter]) => ({ muxData, nextChapter }))
      : Promise.resolve({ muxData: null, nextChapter: null });

    const [attachments, chapterAccessData] = await Promise.all([
      attachmentsPromise,
      chapterAccessDataPromise,
    ]);

    const { muxData, nextChapter } = chapterAccessData;

    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    }
  }
}
