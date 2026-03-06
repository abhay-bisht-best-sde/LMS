import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ExternalLink, File } from "lucide-react";

import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";

import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { CourseProgressButton } from "./_components/course-progress-button";

const stripUuidPrefix = (fileName: string) => {
  const uuidPrefixPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;
  const cleanedFileName = fileName.replace(uuidPrefixPattern, "");
  return cleanedFileName || fileName;
};

const getFileExtension = (fileName: string) => {
  const parts = fileName.split(".");
  if (parts.length < 2) {
    return "FILE";
  }

  return (parts.pop() || "FILE").toUpperCase();
};

const ChapterIdPage = async ({
  params
}: {
  params: { courseId: string; chapterId: string }
}) => {
  const { userId } = auth();
  
  if (!userId) {
    return redirect("/");
  } 

  const {
    chapter,
    course,
    muxData,
    attachments,
    nextChapter,
    userProgress,
    purchase,
  } = await getChapter({
    userId,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  if (!chapter || !course) {
    return redirect("/")
  }


  const isLocked = !chapter.isFree && !purchase;
  const completeOnEnd = !!purchase && !userProgress?.isCompleted;

  return ( 
    <div>
      {userProgress?.isCompleted && (
        <Banner
          variant="success"
          label="You already completed this chapter."
        />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label="You need to purchase this course to watch this chapter."
        />
      )}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          <VideoPlayer
            chapterId={params.chapterId}
            title={chapter.title}
            courseId={params.courseId}
            nextChapterId={nextChapter?.id}
            hasVideo={!!chapter.videoUrl}
            playbackId={muxData?.playbackId ?? undefined}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
          />
        </div>
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">
              {chapter.title}
            </h2>
            {purchase ? (
              <CourseProgressButton
                chapterId={params.chapterId}
                courseId={params.courseId}
                nextChapterId={nextChapter?.id}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={params.courseId}
                price={course.price!}
              />
            )}
          </div>
          <Separator />
          <div className="p-4">
            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 sm:p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
                Chapter Description
              </p>
              <Preview value={chapter.description!} />
            </div>
          </div>
          {!!attachments.length && (
            <>
              <Separator />
              <div className="p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-700">
                  Chapter Resources
                </p>
                {attachments.map((attachment) => {
                  const displayName = stripUuidPrefix(attachment.name);
                  const extension = getFileExtension(displayName);

                  return (
                    <a 
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={attachment.id}
                      className="group flex items-center gap-3 w-full rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-white p-3 sm:p-4 transition hover:border-sky-300 hover:shadow-sm"
                    >
                      <div className="h-10 w-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
                        <File className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm sm:text-base font-medium text-slate-900"
                          title={displayName}
                        >
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500">
                          Attachment • {extension}
                        </p>
                      </div>
                      <span className="hidden sm:inline-flex items-center text-xs font-medium text-sky-700 bg-sky-100 rounded-md px-2 py-1">
                        Open
                      </span>
                      <ExternalLink className="h-4 w-4 text-sky-700 flex-shrink-0 transition group-hover:translate-x-0.5" />
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
   );
}
 
export default ChapterIdPage;
