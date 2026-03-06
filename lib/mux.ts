import Mux from "@mux/mux-node";

const muxTokenId = process.env.MUX_TOKEN_ID;
const muxTokenSecret = process.env.MUX_TOKEN_SECRET;

const videoClient =
  muxTokenId && muxTokenSecret
    ? new Mux(muxTokenId, muxTokenSecret).Video
    : null;

export type MuxAssetStatus = "preparing" | "ready" | "errored";

export interface MuxAssetStatusResult {
  status: MuxAssetStatus;
  errors: string[];
}

const normalizeMuxErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
      return maybeMessage;
    }
  }

  return "Video processing failed on Mux.";
};

export const getMuxAssetStatus = async (
  assetId: string
): Promise<MuxAssetStatusResult> => {
  if (!videoClient) {
    return {
      status: "preparing",
      errors: [],
    };
  }

  try {
    const asset = await videoClient.Assets.get(assetId);
    const status = asset.status;

    if (status === "errored") {
      return {
        status,
        errors: asset.errors?.messages ?? ["Video processing failed on Mux."],
      };
    }

    if (status === "ready") {
      return {
        status,
        errors: [],
      };
    }

    return {
      status: "preparing",
      errors: [],
    };
  } catch (error) {
    console.log("[MUX_ASSET_STATUS]", error);
    return {
      status: "errored",
      errors: [normalizeMuxErrorMessage(error)],
    };
  }
};

export const isMuxAssetReady = async (assetId: string) => {
  const asset = await getMuxAssetStatus(assetId);
  return asset.status === "ready";
};
