import { useEffect, useRef, useState } from 'react';

const SmoothScroll = ({ 
  scrollSensitivity = 20,
  debounceTime = 50,
  scrollThreshold = 50,
  animationDuration = 1000,
}) => {
  const isScrollingRef = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const accumulatedDeltaRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and when window resizes
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 999);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Don't add scroll handling for mobile
    if (isMobile) {
      document.documentElement.style.scrollSnapType = 'none';
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) return;

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      accumulatedDeltaRef.current += Math.abs(e.deltaY);

      scrollTimeout.current = setTimeout(() => {
        if (accumulatedDeltaRef.current > scrollSensitivity) {
          const sections = document.querySelectorAll('section');
          const scrollPosition = window.scrollY;
          
          let targetSection: Element | null = null;
          let minDistance = Infinity;

          sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollPosition;
            const distance = e.deltaY > 0 
              ? sectionTop - scrollPosition
              : scrollPosition - sectionTop;
            
            if (distance > 0 && distance < minDistance) {
              minDistance = distance;
              targetSection = section;
            }
          });

          if (targetSection && Math.abs(targetSection.getBoundingClientRect().top) > scrollThreshold) {
            isScrollingRef.current = true;
            
            targetSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });

            setTimeout(() => {
              isScrollingRef.current = false;
            }, animationDuration);
          }
        }
        
        accumulatedDeltaRef.current = 0;
      }, debounceTime);
    };

    // Only add scroll handling for non-mobile
    if (!isMobile) {
      window.addEventListener('wheel', handleWheel, { passive: true });
      document.documentElement.style.scrollSnapType = 'y proximity';
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        section.style.scrollSnapAlign = 'start';
      });
    }

    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [scrollSensitivity, debounceTime, scrollThreshold, animationDuration, isMobile]);

  return null;
};

export default SmoothScroll;