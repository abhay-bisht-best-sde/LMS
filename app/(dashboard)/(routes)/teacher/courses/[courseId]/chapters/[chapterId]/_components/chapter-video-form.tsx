"use client";

import * as z from "zod";
import axios from "axios";
import dynamic from "next/dynamic";
import { AlertCircle, Loader2, Pencil, PlusCircle, Video } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter, MuxData } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
};

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

type ChapterVideoStatus = "missing" | "preparing" | "ready" | "errored";

interface ChapterVideoStatusResponse {
  status: ChapterVideoStatus;
  playbackId: string | null;
  errors: string[];
}

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [resolvedPlaybackId, setResolvedPlaybackId] = useState<string | null>(
    initialData?.muxData?.playbackId ?? null
  );
  const [status, setStatus] = useState<ChapterVideoStatus>(
    !initialData.videoUrl
      ? "missing"
      : "preparing"
  );
  const [statusErrors, setStatusErrors] = useState<string[]>([]);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  useEffect(() => {
    setResolvedPlaybackId(initialData?.muxData?.playbackId ?? null);
    setStatus(
      !initialData.videoUrl
        ? "missing"
        : "preparing"
    );
    setStatusErrors([]);
  }, [
    initialData.videoUrl,
    initialData.muxData?.playbackId,
    courseId,
    chapterId,
  ]);

  useEffect(() => {
    if (isEditing || status !== "preparing") {
      return;
    }

    let isCancelled = false;

    const pollStatus = async () => {
      try {
        const response = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/video-status`,
          { cache: "no-store" }
        );

        if (!response.ok || isCancelled) {
          return;
        }

        const data = (await response.json()) as ChapterVideoStatusResponse;

        if (isCancelled) {
          return;
        }

        setStatus(data.status);
        setStatusErrors(data.errors || []);
        setResolvedPlaybackId(data.playbackId);
      } catch (error) {
        if (isCancelled) {
          return;
        }
        setStatus("errored");
        setStatusErrors([
          error instanceof Error ? error.message : "Failed to check video status.",
        ]);
      }
    };

    void pollStatus();
    const intervalId = window.setInterval(pollStatus, 5000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isEditing, status, courseId, chapterId]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Avoid replacing the Mux asset when the URL hasn't changed (e.g. dropzone re-fire).
      if (values.videoUrl === initialData.videoUrl) {
        toast.success("Chapter updated");
        toggleEdit();
        router.refresh();
        return;
      }
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && (
            <>Cancel</>
          )}
          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a video
            </>
          )}
          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit video
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        !initialData.videoUrl ? (
          <div className="mt-2 flex items-center justify-center h-[25rem] bg-slate-200 rounded-md">
            <Video className="h-10 w-10 text-slate-500" />
          </div>
        ) : status === "preparing" ? (
          <div className="mt-2 flex items-center justify-center h-[25rem] bg-slate-200 rounded-md text-sm text-slate-600 flex-col gap-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            <p>Video is processing on Mux.</p>
          </div>
        ) : status === "errored" ? (
          <div className="mt-2 flex items-center justify-center h-[25rem] bg-red-50 rounded-md text-sm text-red-700 flex-col gap-y-2 px-4 text-center">
            <AlertCircle className="h-6 w-6" />
            <p className="font-medium">Video processing failed.</p>
            {statusErrors[0] && <p className="text-xs">{statusErrors[0]}</p>}
          </div>
        ) : status === "ready" && resolvedPlaybackId ? (
          <div className="relative mt-2 h-[25rem] rounded-md overflow-hidden bg-black border">
            <MuxPlayer
              className="h-full w-full"
              playbackId={resolvedPlaybackId}
              onError={() => {
                setStatus("errored");
                setStatusErrors(["Playback failed. Please try again shortly."]);
              }}
            />
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-center h-[25rem] bg-slate-200 rounded-md text-sm text-slate-600">
            Video is not currently available.
          </div>
        )
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="chapterVideo"
            onChange={(url) => {
              if (url) {
                onSubmit({ videoUrl: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
           Upload this chapter&apos;s video
          </div>
        </div>
      )}
      {initialData.videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          The status updates automatically. Player appears when Mux marks the asset as ready.
        </div>
      )}
    </div>
  )
}
