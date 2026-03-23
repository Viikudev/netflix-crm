// hooks/useIsMobile.ts
"use client";

import { useState, useEffect } from "react";

const useIsMobile = (breakpoint = 1180): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // This code only runs on the client side
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Set initial value
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
