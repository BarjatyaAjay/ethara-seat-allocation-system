import { useEffect, useState, useRef } from "react";

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const AnimatedNumber = ({ value, duration = 600, formatter }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    // Parse numeric part
    let target = 0;
    let suffix = "";

    if (typeof value === "number") {
      target = value;
    } else if (typeof value === "string") {
      const match = value.match(/([\d.]+)(.*)/);
      if (match) {
        target = parseFloat(match[1]) || 0;
        suffix = match[2] || "";
      }
    }

    const start = prevValueRef.current;
    if (start === target) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentNumber = start + (target - start) * easedProgress;

      if (formatter) {
        setDisplayValue(formatter(currentNumber, suffix));
      } else if (typeof value === "string" && value.includes("%")) {
        setDisplayValue(`${currentNumber.toFixed(2)}%`);
      } else if (typeof value === "number" || !isNaN(target)) {
        setDisplayValue(Math.round(currentNumber).toLocaleString() + suffix);
      } else {
        setDisplayValue(value);
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = target;
        setDisplayValue(value);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration, formatter]);

  return <span>{displayValue}</span>;
};

export default AnimatedNumber;
