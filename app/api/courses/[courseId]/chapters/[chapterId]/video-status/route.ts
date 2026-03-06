import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getMuxAssetStatus } from "@/lib/mux";

type VideoStatus = "missing" | "preparing" | "ready" | "errored";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      include: {
        course: {
          select: {
            userId: true,
          },
        },
        muxData: true,
      },
    });

    if (!chapter) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const isOwner = chapter.course.userId === userId;

    if (!isOwner) {
      if (!chapter.isPublished) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      if (!chapter.isFree) {
        const purchase = await db.purchase.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: params.courseId,
            },
          },
        });

        if (!purchase) {
          return new NextResponse("Forbidden", { status: 403 });
        }
      }
    }

    if (!chapter.videoUrl) {
      return NextResponse.json({
        status: "missing" as VideoStatus,
        playbackId: null,
        errors: [],
      });
    }

    if (!chapter.muxData?.assetId) {
      return NextResponse.json({
        status: "preparing" as VideoStatus,
        playbackId: null,
        errors: [],
      });
    }

    const asset = await getMuxAssetStatus(chapter.muxData.assetId);

    return NextResponse.json({
      status: asset.status as VideoStatus,
      playbackId: asset.status === "ready" ? chapter.muxData.playbackId : null,
      errors: asset.errors,
    });
  } catch (error) {
    console.log("[CHAPTER_VIDEO_STATUS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

