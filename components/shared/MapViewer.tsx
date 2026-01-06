import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, X } from 'lucide-react';

interface MapViewerProps {
    mapData: string;
    onClose: () => void;
    initialFocus?: { x: number, y: number };
}

export const MapViewer: React.FC<MapViewerProps> = ({ mapData, onClose, initialFocus }) => {
    const isPdf = mapData.startsWith('data:application/pdf');
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (initialFocus && !isPdf) {
            // Need to wait for image to load to know dimensions, but let's try a timeout or logical approach
            // For now, let's assume we can set it.
            // Focus X/Y are 0-1.

            // Allow time for image mount
            setTimeout(() => {
                const container = containerRef.current;
                const img = imgRef.current;

                if (!container || !img) return;

                // Target Zoom Level
                const targetScale = 2.5;

                const viewportW = container.clientWidth;
                const viewportH = container.clientHeight;

                // We need to use naturalWidth/Height if we want precision, or current displayed width.
                // Since we are creating transform on the wrapper, let's use the image's current dimensions.
                // Wait, if we use a transform scale, we are scaling the element from its current size.
                // The image has 'max-w-full'. 

                const imgW = img.width || 1000;
                const imgH = img.height || 1000;

                // Calculate position to center the target
                // If we scale by 2.5, the content is 2.5x larger.
                // The point (x,y) in the scaled image is at (x * ImageWidth * Scale, y * ImageHeight * Scale).
                // We want that point to be at (ViewportWidth/2, ViewportHeight/2).
                // Translate X = NewCenter - PointInScaledImage

                const pX = -(initialFocus.x * imgW * targetScale) + (viewportW / 2);
                const pY = -(initialFocus.y * imgH * targetScale) + (viewportH / 2);

                setScale(targetScale);
                setPosition({ x: pX, y: pY });
            }, 300);
        }
    }, [initialFocus, mapData, isPdf]);

    useEffect(() => {
        if (isPdf) {
            try {
                const parts = mapData.split(',');
                const byteString = atob(parts[1]);
                const mimeString = parts[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });
                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
                return () => URL.revokeObjectURL(url);
            } catch (e) {
                console.error("PDF conversion error", e);
            }
        }
    }, [mapData, isPdf]);

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col animate-in fade-in duration-300">
            <div className="p-6 bg-slate-800 flex items-center justify-between text-white border-b border-white/10">
                <div className="flex items-center space-x-4">
                    <MapIcon />
                    <h2 className="text-xl font-black tracking-tighter">Project Floorplan Viewer</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                    <X size={24} />
                </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-950 p-4 flex items-center justify-center">
                {isPdf ? (
                    <iframe
                        src={blobUrl || mapData}
                        className="w-full h-full border-none rounded-lg"
                        title="PDF Map Viewer"
                    />
                ) : (
                    <div
                        ref={containerRef}
                        className="w-full h-full overflow-hidden flex items-center justify-center"
                    >
                        <div
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                            }}
                            className="origin-top-left"
                        >
                            <img
                                ref={imgRef}
                                src={mapData}
                                alt="Floorplan"
                                className="max-w-none shadow-2xl rounded-lg" // removed max-w-full to prevent conflict with transform logic? No, max-w-none is better for zoom
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
