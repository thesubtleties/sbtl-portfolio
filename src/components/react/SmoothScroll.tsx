import { useEffect, useRef, useState } from 'react';

const SmoothScroll = ({
  scrollSensitivity = 5,
  debounceTime = 10,
  scrollThreshold = 20,
  animationDuration = 1000,
}) => {
  const isScrollingRef = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const accumulatedDeltaRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 999);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.scrollSnapType = 'none';
      return;
    }

    // Add this function to prevent default scroll behavior
    const preventScroll = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

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

          sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollPosition;
            const distance =
              e.deltaY > 0
                ? sectionTop - scrollPosition
                : scrollPosition - sectionTop;

            if (distance > 0 && distance < minDistance) {
              minDistance = distance;
              targetSection = section;
            }
          });

          if (
            targetSection &&
            Math.abs(targetSection.getBoundingClientRect().top) >
              scrollThreshold
          ) {
            isScrollingRef.current = true;

            // Add event listener to prevent scroll during animation
            window.addEventListener('wheel', preventScroll, { passive: false });

            targetSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });

            setTimeout(() => {
              isScrollingRef.current = false;
              // Remove the prevent scroll listener after animation
              window.removeEventListener('wheel', preventScroll);
            }, animationDuration);
          }
        }

        accumulatedDeltaRef.current = 0;
      }, debounceTime);
    };

    if (!isMobile) {
      // Change passive to false to allow preventDefault
      window.addEventListener('wheel', handleWheel, { passive: false });
      document.documentElement.style.scrollSnapType = 'y proximity';
      const sections = document.querySelectorAll('section');
      sections.forEach((section) => {
        section.style.scrollSnapAlign = 'start';
      });
    }

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('wheel', preventScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [
    scrollSensitivity,
    debounceTime,
    scrollThreshold,
    animationDuration,
    isMobile,
  ]);

  return null;
};

export default SmoothScroll;
