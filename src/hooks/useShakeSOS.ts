import { useEffect, useRef, useCallback } from "react";

interface UseShakeSOSOptions {
  threshold?: number; // acceleration threshold (m/s²)
  requiredShakes?: number;
  timeWindow?: number; // ms
  onShakeDetected: () => void;
  enabled?: boolean;
}

const useShakeSOS = ({
  threshold = 25,
  requiredShakes = 3,
  timeWindow = 5000,
  onShakeDetected,
  enabled = true,
}: UseShakeSOSOptions) => {
  const shakeTimestamps = useRef<number[]>([]);
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const cooldown = useRef(false);

  const handleMotion = useCallback(
    (e: DeviceMotionEvent) => {
      if (!enabled || cooldown.current) return;

      const accel = e.accelerationIncludingGravity;
      if (!accel || accel.x == null || accel.y == null || accel.z == null) return;

      const deltaX = Math.abs(accel.x - lastAccel.current.x);
      const deltaY = Math.abs(accel.y - lastAccel.current.y);
      const deltaZ = Math.abs(accel.z - lastAccel.current.z);

      lastAccel.current = { x: accel.x, y: accel.y, z: accel.z };

      const totalDelta = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);

      if (totalDelta > threshold) {
        const now = Date.now();
        shakeTimestamps.current.push(now);

        // Remove old timestamps outside the time window
        shakeTimestamps.current = shakeTimestamps.current.filter(
          (t) => now - t < timeWindow
        );

        if (shakeTimestamps.current.length >= requiredShakes) {
          shakeTimestamps.current = [];
          cooldown.current = true;
          onShakeDetected();
          // 10s cooldown to prevent repeated triggers
          setTimeout(() => {
            cooldown.current = false;
          }, 10000);
        }
      }
    },
    [enabled, threshold, requiredShakes, timeWindow, onShakeDetected]
  );

  useEffect(() => {
    if (!enabled) return;

    // Request permission on iOS 13+
    if (
      typeof (DeviceMotionEvent as any).requestPermission === "function"
    ) {
      (DeviceMotionEvent as any)
        .requestPermission()
        .then((state: string) => {
          if (state === "granted") {
            window.addEventListener("devicemotion", handleMotion);
          }
        })
        .catch(() => {});
    } else {
      window.addEventListener("devicemotion", handleMotion);
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [handleMotion, enabled]);
};

export default useShakeSOS;
