"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, AlertCircle } from "lucide-react";
import { CameraTutorial } from "@/components/molecules/camera/CameraTutorial";
import { DetectionResultModal } from "@/components/molecules/camera/DetectionResultModal";
import { WordPreviewModal } from "@/components/molecules/camera/WordPreviewModal";
import {
  useDetectObjects,
  useGenerateCardsForWord,
} from "@/lib/hooks/useDetection";
import type { DetectedObject, GeneratedCard } from "@/lib/service/detection";

const TUTORIAL_KEY = "vrword:camera_tutorial_seen";

type Stage = "viewfinder" | "detecting" | "results" | "generating" | "preview";

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(TUTORIAL_KEY);
  });
  const [stage, setStage] = useState<Stage>("viewfinder");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasCameraStream, setHasCameraStream] = useState(false);

  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(
    null,
  );
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(
    null,
  );

  const detectMutation = useDetectObjects();
  const generateMutation = useGenerateCardsForWord();

  // --- Inicializa câmera ---
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraStream(true);
      } catch {
        setCameraError(
          "Não foi possível acessar a câmera. Verifique as permissões do navegador.",
        );
      }
    }

    startCamera();

    // Mostra tutorial na primeira vez
    // (estado inicializado via lazy initializer do useState)

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleDismissTutorial = useCallback(() => {
    localStorage.setItem(TUTORIAL_KEY, "1");
    setShowTutorial(false);
  }, []);

  // --- Captura frame do vídeo como base64 ---
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    // Remove prefixo "data:image/png;base64," — backend espera base64 puro
    return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
  }, []);

  // --- Dispara detecção ---
  const handleCapture = useCallback(async () => {
    if (stage !== "viewfinder") return;
    const imageBase64 = captureFrame();
    if (!imageBase64) return;

    setStage("detecting");

    try {
      const result = await detectMutation.mutateAsync(imageBase64);
      if (result.objects.length === 0) {
        // Nenhum objeto detectado — volta ao viewfinder com mensagem
        setStage("viewfinder");
        setCameraError("Nenhum objeto reconhecido. Tente aproximar mais.");
        setTimeout(() => setCameraError(null), 3000);
        return;
      }
      setDetectedObjects(result.objects);
      setStage("results");
    } catch {
      setStage("viewfinder");
      setCameraError("Falha na detecção. Verifique sua conexão.");
      setTimeout(() => setCameraError(null), 3000);
    }
  }, [stage, captureFrame, detectMutation]);

  // --- Usuário seleciona objeto na lista PT ---
  const handleSelectObject = useCallback(
    async (obj: DetectedObject) => {
      setSelectedObject(obj);
      setStage("generating");

      try {
        const card = await generateMutation.mutateAsync({ word: obj.labelEn });
        setGeneratedCard(card);
        setStage("preview");
      } catch {
        setStage("results");
        setCameraError("Erro ao gerar frases. Tente novamente.");
        setTimeout(() => setCameraError(null), 3000);
      }
    },
    [generateMutation],
  );

  const handleCloseResults = useCallback(() => {
    setDetectedObjects([]);
    setStage("viewfinder");
  }, []);

  const handleSaved = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const handleClosePreview = useCallback(() => {
    setGeneratedCard(null);
    setSelectedObject(null);
    setDetectedObjects([]);
    setStage("viewfinder");
  }, []);

  const isCapturing = stage === "detecting" || stage === "generating";

  return (
    <div className="relative h-dvh w-full bg-black overflow-hidden">
      {/* Vídeo ao vivo */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        aria-label="Câmera ao vivo"
      />

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      {/* Grade de foco decorativa */}
      {stage === "viewfinder" && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* Barra superior */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-safe-top pb-3 bg-linear-to-b from-black/70 to-transparent">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          aria-label="Voltar ao dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-white/80 text-sm font-medium tracking-wide">
          Detectar objeto
        </span>
        <div className="w-9" aria-hidden /> {/* espaçador */}
      </div>

      {/* Mensagem de erro transiente */}
      {cameraError && (
        <div
          role="alert"
          className="absolute top-20 inset-x-4 z-30 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-900/80 backdrop-blur-sm text-white text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {cameraError}
        </div>
      )}

      {/* Erro de câmera permanente */}
      {!cameraError && stage === "viewfinder" && !hasCameraStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <AlertCircle className="w-12 h-12 text-white/40" />
          <p className="text-white/60 text-sm">
            Câmera indisponível. Verifique as permissões e recarregue a página.
          </p>
        </div>
      )}

      {/* Indicador de carregamento (detecting / generating) */}
      {isCapturing && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-white text-sm">
            {stage === "detecting"
              ? "Identificando objetos…"
              : "Gerando frases…"}
          </p>
        </div>
      )}

      {/* Botão de captura */}
      <div className="absolute bottom-0 inset-x-0 z-20 flex justify-center pb-safe-bottom pt-8 bg-linear-to-t from-black/70 to-transparent">
        <button
          onClick={handleCapture}
          disabled={isCapturing || stage !== "viewfinder"}
          aria-label="Capturar foto"
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all
            ${
              isCapturing || stage !== "viewfinder"
                ? "border-white/20 bg-white/10 cursor-not-allowed"
                : "border-white bg-white/20 hover:bg-white/30 active:scale-95"
            }`}
        >
          <Camera className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Tutorial (primeiro uso) */}
      {showTutorial && <CameraTutorial onDismiss={handleDismissTutorial} />}

      {/* Modal de resultados de detecção */}
      {stage === "results" && detectedObjects.length > 0 && (
        <DetectionResultModal
          objects={detectedObjects}
          onSelect={handleSelectObject}
          onClose={handleCloseResults}
        />
      )}

      {/* Modal de preview da palavra */}
      {stage === "preview" && generatedCard && selectedObject && (
        <WordPreviewModal
          wordEn={selectedObject.labelEn}
          wordPt={selectedObject.labelPt}
          card={generatedCard}
          onClose={handleClosePreview}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
