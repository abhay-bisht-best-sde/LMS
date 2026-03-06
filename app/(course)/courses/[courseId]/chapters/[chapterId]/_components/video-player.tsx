"use client";

import axios from "axios";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

interface VideoPlayerProps {
  playbackId?: string;
  hasVideo: boolean;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
};

type ChapterVideoStatus = "missing" | "preparing" | "ready" | "errored";

interface ChapterVideoStatusResponse {
  status: ChapterVideoStatus;
  playbackId: string | null;
  errors: string[];
}

export const VideoPlayer = ({
  playbackId,
  hasVideo,
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  title,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [resolvedPlaybackId, setResolvedPlaybackId] = useState<string | null>(
    playbackId ?? null
  );
  const [status, setStatus] = useState<ChapterVideoStatus>(
    !hasVideo ? "missing" : "preparing"
  );
  const [statusErrors, setStatusErrors] = useState<string[]>([]);
  const router = useRouter();
  const confetti = useConfettiStore();

  useEffect(() => {
    setIsReady(false);
    setResolvedPlaybackId(playbackId ?? null);
    setStatus(!hasVideo ? "missing" : "preparing");
    setStatusErrors([]);
  }, [playbackId, hasVideo, courseId, chapterId]);

  useEffect(() => {
    if (isLocked || status !== "preparing") {
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
  }, [status, isLocked, courseId, chapterId]);

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
          isCompleted: true,
        });

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success("Progress updated");
        router.refresh();

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="relative aspect-video">
      {status === "preparing" && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Video is being processed on Mux.</p>
        </div>
      )}
      {status === "errored" && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary px-6 text-center">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm font-medium">Video processing failed.</p>
          {statusErrors[0] && (
            <p className="text-xs text-slate-300">{statusErrors[0]}</p>
          )}
        </div>
      )}
      {status === "missing" && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-secondary px-6 text-center">
          <p className="text-sm">Video is not currently available.</p>
        </div>
      )}
      {!isReady && !isLocked && status === "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">
            This chapter is locked
          </p>
        </div>
      )}
      {!isLocked && status === "ready" && resolvedPlaybackId && (
        <MuxPlayer
          title={title}
          className={cn(
            !isReady && "hidden"
          )}
          onCanPlay={() => setIsReady(true)}
          onError={() => {
            setStatus("errored");
            setStatusErrors(["Playback failed. Please try again shortly."]);
            setIsReady(false);
          }}
          onEnded={onEnd}
          autoPlay
          playbackId={resolvedPlaybackId}
        />
      )}
    </div>
  )
}
