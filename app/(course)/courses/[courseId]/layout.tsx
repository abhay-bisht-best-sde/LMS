import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";

const CourseLayout = async ({
  children,
  params
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/")
  }

  const [course, purchase] = await Promise.all([
    db.course.findUnique({
      where: {
        id: params.courseId,
      },
      include: {
        chapters: {
          where: {
            isPublished: true,
          },
          include: {
            userProgress: {
              where: {
                userId,
              }
            }
          },
          orderBy: {
            position: "asc"
          }
        },
      },
    }),
    db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!course) {
    return redirect("/");
  }

  const totalChapters = course.chapters.length;
  const completedChapters = course.chapters.filter(
    (chapter) => chapter.userProgress?.[0]?.isCompleted
  ).length;
  const progressCount = totalChapters === 0 ? 0 : (completedChapters / totalChapters) * 100;
  const isPurchased = Boolean(purchase);

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar
          course={course}
          progressCount={progressCount}
          isPurchased={isPurchased}
        />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
          isPurchased={isPurchased}
        />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">
        {children}
      </main>
    </div>
  )
}

export default CourseLayout
