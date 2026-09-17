import React, { useState, useRef } from "react";
import { VisualEvidenceItem } from "../types";
import {
  Camera,
  Video,
  Upload,
  X,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Film,
  Play,
  Pause,
  Clock,
  Trash2,
  Eye,
} from "lucide-react";

interface VisualEvidenceUploaderProps {
  value: VisualEvidenceItem | null | undefined;
  onChange: (evidence: VisualEvidenceItem | null) => void;
  disabled?: boolean;
}

export const VisualEvidenceUploader: React.FC<VisualEvidenceUploaderProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Resize and convert image to clean base64 data URL
  const processImageFile = (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDimension = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

          onChange({
            type: "image",
            dataUrl,
            mimeType: "image/jpeg",
            name: file.name,
            sizeBytes: Math.round((dataUrl.length * 3) / 4),
          });
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setErrorMessage("Could not load image file. Please try another photo.");
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read image file.");
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  // Validate video duration (maximum 10 seconds) and extract representative frame for analysis
  const processVideoFile = (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    (video as any).playsInline = true;

    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const duration = video.duration;

      // Allow small tolerance (10.5s)
      if (duration > 10.5) {
        URL.revokeObjectURL(objectUrl);
        setErrorMessage(
          `Video is ${duration.toFixed(1)} seconds long. Maximum allowed video length is 10 seconds.`
        );
        setIsProcessing(false);
        return;
      }

      // Seek to middle frame to capture key visual evidence
      video.currentTime = Math.min(1, duration / 2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDim = 960;
        let w = video.videoWidth || 640;
        let h = video.videoHeight || 480;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const frameDataUrl = canvas.toDataURL("image/jpeg", 0.85);

          onChange({
            type: "video",
            dataUrl: frameDataUrl,
            mimeType: "image/jpeg", // representative frame payload for multimodal analysis
            name: file.name,
            sizeBytes: file.size,
            durationSeconds: Math.round(video.duration * 10) / 10,
          });
        }
      } catch (err) {
        console.warn("Could not extract video frame:", err);
      } finally {
        URL.revokeObjectURL(objectUrl);
        setIsProcessing(false);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setErrorMessage("Unsupported or unreadable video file format. Please upload MP4 or WebM.");
      setIsProcessing(false);
    };

    video.src = objectUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select an image file (JPEG, PNG, WebP).");
        return;
      }
      processImageFile(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        setErrorMessage("Please select a video file (MP4, WebM, MOV).");
        return;
      }
      processVideoFile(file);
    }
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      processImageFile(file);
    } else if (file.type.startsWith("video/")) {
      processVideoFile(file);
    } else {
      setErrorMessage("Please drop an image file or a short video under 10 seconds.");
    }
  };

  return (
    <div id="visual-evidence-container" className="space-y-3 pt-2">
      {/* Field Label & Optional Indicator */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#17365D] flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-[#2D6CDF]" />
          <span>Visual Evidence</span>
          <span className="text-[11px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-[4px] border border-slate-200">
            Optional Supporting Evidence
          </span>
        </label>
        {value && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Evidence Attached
          </span>
        )}
      </div>

      {/* Mandatory Citizen Privacy Notice */}
      <div className="p-3 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-[#2D6CDF] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-[11px] text-[#17365D]">Citizen Privacy Notice:</p>
          <p className="text-[11px] leading-relaxed text-slate-700">
            <strong>Do not upload faces, vehicle numbers, home interiors, or other personal information.</strong>
            {" "}Focus exclusively on the public infrastructure defect (e.g., road waste, leaking pipeline, dark street). Media is evaluated in-session only and is not permanently stored.
          </p>
        </div>
      </div>

      {/* Upload Buttons & Dropzone */}
      {!value ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`rounded-[10px] border-2 border-dashed p-4 transition text-center ${
            isDragOver
              ? "border-[#2D6CDF] bg-[#EFF6FF]"
              : "border-[#CBD5E1] bg-white hover:bg-slate-50/70"
          }`}
        >
          {isProcessing ? (
            <div className="py-4 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-[#2D6CDF] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-600 font-medium">Validating visual evidence...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Drag and drop a photo or short clip here, or choose an option below:
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* 1. Upload or Capture Photo */}
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={disabled}
                />
                <button
                  type="button"
                  id="btn-upload-photo"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={disabled}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-[8px] bg-[#17365D] hover:bg-[#234570] text-white text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload or capture a photo</span>
                </button>

                {/* 2. Upload or Record Short Video */}
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoChange}
                  accept="video/*"
                  capture="environment"
                  className="hidden"
                  disabled={disabled}
                />
                <button
                  type="button"
                  id="btn-upload-video"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={disabled}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-[8px] bg-white hover:bg-slate-100 text-[#17365D] border border-[#CBD5E1] text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <Video className="w-3.5 h-3.5 text-[#2D6CDF]" />
                  <span>Upload or record a short video (max 10s)</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Supports JPG, PNG, WebP photos &amp; MP4/WebM videos up to 10 seconds
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Attached Visual Evidence Preview Card */
        <div className="rounded-[10px] border border-[#CBD5E1] bg-white p-3.5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Thumbnail Preview */}
            <div className="relative w-16 h-16 rounded-[6px] overflow-hidden bg-slate-100 border border-[#CBD5E1] shrink-0">
              <img
                src={value.dataUrl}
                alt="Visual Evidence Preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-mono text-center py-0.5">
                {value.type === "video" ? "VIDEO FRAME" : "PHOTO"}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#17365D] truncate max-w-[180px] sm:max-w-xs">
                  {value.name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] text-[#2D6CDF] border border-[#BFDBFE]">
                  {value.type === "video"
                    ? `Video (${value.durationSeconds || "<10"}s)`
                    : "Photo"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Ready for Gemini multimodal corroboration • In-session memory only
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-remove-evidence"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 rounded-[6px] bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
