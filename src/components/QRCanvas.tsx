import React, { useEffect, useRef } from 'react';
import QRCodeStyling, { FileExtension } from 'qr-code-styling';
import { QRStyleConfig } from '../types';

interface QRCanvasProps {
  content: string;
  styleConfig: QRStyleConfig;
  className?: string;
  onReady?: () => void;
}

export interface QRCanvasRef {
  download: (ext: 'png' | 'svg' | 'jpeg', resolution?: number) => Promise<void>;
  getBlob: (ext?: 'png' | 'jpeg') => Promise<Blob | null>;
}

export const QRCanvas = React.forwardRef<QRCanvasRef, QRCanvasProps>(
  ({ content, styleConfig, className = '', onReady }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStyling | null>(null);

    useEffect(() => {
      if (!qrCodeRef.current) {
        const dotsOptions: any = {
          color: styleConfig.fgColor,
          type: styleConfig.dotType,
        };
        if (styleConfig.gradient?.enabled && styleConfig.gradient.colorStops.length >= 2) {
          dotsOptions.gradient = {
            type: styleConfig.gradient.type,
            rotation: (styleConfig.gradient.rotation * Math.PI) / 180,
            colorStops: styleConfig.gradient.colorStops,
          };
        }

        qrCodeRef.current = new QRCodeStyling({
          width: 320,
          height: 320,
          type: 'svg',
          data: content || 'https://nova-qr.app',
          image: styleConfig.logoUrl || undefined,
          margin: styleConfig.margin ?? 12,
          qrOptions: {
            errorCorrectionLevel: styleConfig.logoUrl ? 'H' : (styleConfig.errorCorrection || 'Q'),
          },
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: styleConfig.logoSize ?? 0.25,
            margin: 4,
            crossOrigin: 'anonymous',
          },
          dotsOptions,
          backgroundOptions: {
            color: styleConfig.bgColor,
          },
          cornersSquareOptions: {
            color: styleConfig.cornerSquareColor || styleConfig.fgColor,
            type: styleConfig.cornerSquareType,
          },
          cornersDotOptions: {
            color: styleConfig.cornerDotColor || styleConfig.fgColor,
            type: styleConfig.cornerDotType,
          },
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          qrCodeRef.current.append(containerRef.current);
        }
      } else {
        const dotsOptions: any = {
          color: styleConfig.fgColor,
          type: styleConfig.dotType,
        };
        if (styleConfig.gradient?.enabled && styleConfig.gradient.colorStops.length >= 2) {
          dotsOptions.gradient = {
            type: styleConfig.gradient.type,
            rotation: (styleConfig.gradient.rotation * Math.PI) / 180,
            colorStops: styleConfig.gradient.colorStops,
          };
        }

        qrCodeRef.current.update({
          data: content || 'https://nova-qr.app',
          image: styleConfig.logoUrl || undefined,
          margin: styleConfig.margin ?? 12,
          qrOptions: {
            errorCorrectionLevel: styleConfig.logoUrl ? 'H' : (styleConfig.errorCorrection || 'Q'),
          },
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: styleConfig.logoSize ?? 0.25,
            margin: 4,
          },
          dotsOptions,
          backgroundOptions: {
            color: styleConfig.bgColor,
          },
          cornersSquareOptions: {
            color: styleConfig.cornerSquareColor || styleConfig.fgColor,
            type: styleConfig.cornerSquareType,
          },
          cornersDotOptions: {
            color: styleConfig.cornerDotColor || styleConfig.fgColor,
            type: styleConfig.cornerDotType,
          },
        });
      }

      onReady?.();
    }, [content, styleConfig, onReady]);

    React.useImperativeHandle(ref, () => ({
      download: async (ext: 'png' | 'svg' | 'jpeg', resolution = 1024) => {
        if (!qrCodeRef.current) return;

        // Temporarily render at desired high resolution for crystal clear download
        const tempDotsOptions: any = {
          color: styleConfig.fgColor,
          type: styleConfig.dotType,
        };
        if (styleConfig.gradient?.enabled && styleConfig.gradient.colorStops.length >= 2) {
          tempDotsOptions.gradient = {
            type: styleConfig.gradient.type,
            rotation: (styleConfig.gradient.rotation * Math.PI) / 180,
            colorStops: styleConfig.gradient.colorStops,
          };
        }

        const tempQR = new QRCodeStyling({
          width: resolution,
          height: resolution,
          type: ext === 'svg' ? 'svg' : 'canvas',
          data: content || 'https://nova-qr.app',
          image: styleConfig.logoUrl || undefined,
          margin: Math.round((styleConfig.margin ?? 12) * (resolution / 320)),
          qrOptions: {
            errorCorrectionLevel: styleConfig.logoUrl ? 'H' : (styleConfig.errorCorrection || 'Q'),
          },
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: styleConfig.logoSize ?? 0.25,
            margin: Math.round(4 * (resolution / 320)),
          },
          dotsOptions: tempDotsOptions,
          backgroundOptions: {
            color: styleConfig.bgColor,
          },
          cornersSquareOptions: {
            color: styleConfig.cornerSquareColor || styleConfig.fgColor,
            type: styleConfig.cornerSquareType,
          },
          cornersDotOptions: {
            color: styleConfig.cornerDotColor || styleConfig.fgColor,
            type: styleConfig.cornerDotType,
          },
        });

        const extension: FileExtension = ext === 'jpeg' ? 'jpeg' : ext === 'svg' ? 'svg' : 'png';
        await tempQR.download({
          name: `nova-qr-${Date.now()}`,
          extension,
        });
      },

      getBlob: async (ext: 'png' | 'jpeg' = 'png'): Promise<Blob | null> => {
        if (!qrCodeRef.current) return null;
        try {
          const raw = await qrCodeRef.current.getRawData(ext === 'jpeg' ? 'jpeg' : 'png');
          if (raw instanceof Blob) {
            return raw;
          }
          if (raw) {
            return new Blob([raw as unknown as BlobPart], { type: `image/${ext}` });
          }
        } catch {
          // Fallback via canvas extraction
          const canvas = containerRef.current?.querySelector('canvas');
          if (canvas) {
            return new Promise((resolve) => {
              canvas.toBlob((b) => resolve(b), `image/${ext}`);
            });
          }
        }
        return null;
      },
    }));

    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-300 ${className}`}
        style={{
          backgroundColor: styleConfig.bgColor,
          boxShadow: `0 8px 30px -6px ${styleConfig.fgColor}25`,
        }}
      />
    );
  }
);

QRCanvas.displayName = 'QRCanvas';
