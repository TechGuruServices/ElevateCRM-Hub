"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner, Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onError,
  isActive
}) => {
  const [scannerState, setScannerState] = useState<'idle' | 'starting' | 'active' | 'error' | 'permission-denied'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scannerElementId = "qr-reader";

  useEffect(() => {
    enumerateCameras();
  }, []);

  useEffect(() => {
    if (isActive && scannerState === 'idle') {
      startScanner();
    } else if (!isActive && scannerRef.current) {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive]);

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices.map(device => ({
        id: device.deviceId,
        label: device.label || `Camera ${device.deviceId.substring(0, 8)}`
      })));
    } catch (error) {
      console.error('Failed to enumerate cameras:', error);
    }
  };

  const startScanner = async () => {
    try {
      setScannerState('starting');
      setErrorMessage('');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        mediaStreamRef.current = stream;
      } catch (permissionError: any) {
        if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDeniedError') {
          setScannerState('permission-denied');
          setErrorMessage('Camera permission denied. Please enable camera access in your browser settings.');
          onError?.('Camera permission denied');
          return;
        }
        throw permissionError;
      }

      const scanner = new Html5QrcodeScanner(
        scannerElementId,
        {
          fps: 10,
          qrbox: { width: 300, height: 200 },
          aspectRatio: 1.777778,
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText: string) => {
          console.log('Barcode scanned:', decodedText);
          onScan(decodedText);
          setScannerState('active');
        },
        (error: any) => {
          if (!error.toString().includes('NotFoundException')) {
            console.warn('Scanner error:', error);
          }
        }
      );

      setScannerState('active');
    } catch (error: any) {
      console.error('Failed to start scanner:', error);
      setErrorMessage(error.message || 'Failed to start camera');
      setScannerState('error');
      onError?.(error.message || 'Failed to start camera');
    }
  };

  const stopScanner = async () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped:', track.label);
      });
      mediaStreamRef.current = null;
    }

    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        console.log('Scanner cleared successfully');
      } catch (error) {
        console.warn('Error clearing scanner:', error);
      }
      scannerRef.current = null;
    }
    
    setScannerState('idle');
  };

  const handleManualInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      if (target.value.trim()) {
        onScan(target.value.trim());
        target.value = '';
      }
    }
  };

  return (
    <div className="barcode-scanner w-full">
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              scannerState === 'active'
                ? 'bg-green-500'
                : scannerState === 'starting'
                ? 'bg-yellow-500 animate-pulse'
                : scannerState === 'error' || scannerState === 'permission-denied'
                ? 'bg-red-500'
                : 'bg-muted'
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {scannerState === 'active' && 'Scanner Active - Point camera at barcode'}
            {scannerState === 'starting' && 'Starting camera...'}
            {scannerState === 'error' && 'Scanner Error'}
            {scannerState === 'permission-denied' && 'Camera Permission Denied'}
            {scannerState === 'idle' && 'Scanner Inactive'}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-destructive">{errorMessage}</span>
              {scannerState === 'permission-denied' && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>To enable camera access:</p>
                  <ul className="list-disc ml-4 mt-1 space-y-1">
                    <li>Click the camera icon in your browser's address bar</li>
                    <li>Select "Allow" for camera permissions</li>
                    <li>Refresh the page and try again</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div
          id={scannerElementId}
          className={`${isActive ? 'block' : 'hidden'} border-2 border-dashed border-border rounded-lg overflow-hidden`}
          style={{ minHeight: '250px' }}
        />
        
        {!isActive && (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card">
            <div className="text-center">
              <Camera className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">Camera scanner inactive</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Enable scanning to use camera</p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="manual-barcode" className="block text-sm font-medium mb-2">
          Manual Barcode Entry
        </label>
        <input
          type="text"
          id="manual-barcode"
          className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
          placeholder="Type or scan barcode here, press Enter"
          onKeyDown={handleManualInput}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Supports UPC, EAN, Code 128, Code 39, and QR codes
        </p>
      </div>

      {availableCameras.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Available cameras: {availableCameras.length}</p>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        <h4 className="font-medium mb-2">Scanning Tips:</h4>
        <ul className="space-y-1 text-xs">
          <li>• Hold device steady and ensure good lighting</li>
          <li>• Position barcode within the scanning frame</li>
          <li>• Try different distances if scan doesn't work</li>
          <li>• Use manual entry if camera scanning fails</li>
        </ul>
      </div>
    </div>
  );
};

export default BarcodeScanner;
