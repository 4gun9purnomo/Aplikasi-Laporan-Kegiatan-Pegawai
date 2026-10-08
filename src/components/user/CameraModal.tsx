import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob, filename: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mendukung akses kamera langsung. Silakan gunakan tombol Galeri/File.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsInitializing(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Tidak dapat membuka kamera';
      setCameraError(
        errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')
          ? 'Izin kamera ditolak. Silakan izinkan kamera di browser atau gunakan opsi unggah berkas galeri.'
          : 'Kamera tidak tersedia di perangkat ini. Silakan gunakan opsi unggah berkas galeri.'
      );
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const filename = `foto_kamera_${Date.now()}.jpg`;
          onCapture(blob, filename);
          stopCamera();
          onClose();
        }
      },
      'image/jpeg',
      0.8
    );
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900/80 text-white z-10 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold">Ambil Foto Kegiatan Realtime</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative flex-1 bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-slate-300 max-w-sm">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-rose-300 font-semibold mb-3">{cameraError}</p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white font-semibold text-xs rounded-xl shadow cursor-pointer hover:bg-amber-700">
                <span>Pilih Foto dari Galeri / Kamera HP</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onCapture(file, file.name);
                      stopCamera();
                      onClose();
                    }
                  }}
                />
              </label>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover aspect-video"
              />
              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs">
                  <span>Membuka kamera...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Controls */}
        {!cameraError && (
          <div className="p-4 bg-slate-900 flex items-center justify-between px-8 border-t border-slate-800">
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-3 rounded-full bg-slate-800 text-slate-300 hover:text-white active:scale-95 transition"
              title="Putar Kamera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Shutter Button */}
            <button
              type="button"
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full border-4 border-amber-400 bg-white flex items-center justify-center shadow-lg active:scale-90 transition transform"
              title="Jepret Foto"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500" />
            </button>

            <div className="w-11" /> {/* balance layout */}
          </div>
        )}
      </div>
    </div>
  );
};
