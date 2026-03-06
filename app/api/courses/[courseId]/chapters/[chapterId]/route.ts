import Mux from "@mux/mux-node";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { utapi } from "uploadthing/server";

import { db } from "@/lib/db";

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!,
);

const getUploadThingFileKey = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const isUploadThingUrl =
      parsedUrl.hostname.includes("utfs.io") ||
      parsedUrl.hostname.includes("uploadthing");
    if (!isUploadThingUrl) {
      return null;
    }
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    const fileIndex = pathParts.indexOf("f");
    if (fileIndex !== -1 && pathParts[fileIndex + 1]) {
      return pathParts[fileIndex + 1];
    }
    return pathParts[pathParts.length - 1] || null;
  } catch {
    return null;
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [ownCourse, chapter] = await Promise.all([
      db.course.findUnique({
        where: {
          id: params.courseId,
          userId,
        }
      }),
      db.chapter.findUnique({
        where: {
          id: params.chapterId,
          courseId: params.courseId,
        }
      }),
    ]);

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!chapter) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId,
        }
      });

      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          }
        });
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: params.chapterId
      }
    });

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true,
      }
    });

    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        }
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { isPublished, ...values } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [ownCourse, existingChapter] = await Promise.all([
      db.course.findUnique({
        where: {
          id: params.courseId,
          userId
        }
      }),
      db.chapter.findUnique({
        where: {
          id: params.chapterId,
          courseId: params.courseId,
        }
      }),
    ]);

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!existingChapter) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const chapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        ...values,
      }
    });

    const videoUrlChanged = values.videoUrl !== undefined && values.videoUrl !== existingChapter.videoUrl;

    if (videoUrlChanged && values.videoUrl) {
      if (existingChapter.videoUrl) {
        const existingFileKey = getUploadThingFileKey(existingChapter.videoUrl);
        if (existingFileKey) {
          try {
            await utapi.deleteFiles(existingFileKey);
          } catch (error) {
            console.log("[UPLOADTHING_DELETE_ERROR]", error);
          }
        }
      }

      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId,
        }
      });

      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          }
        });
      }

      const asset = await Video.Assets.create({
        input: values.videoUrl,
        playback_policy: "public",
        test: false,
      });

      await db.muxData.create({
        data: {
          chapterId: params.chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        }
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}
