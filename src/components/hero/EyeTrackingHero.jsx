import { useEffect, useRef } from 'react';

function EyeTrackingHero() {
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const { clientX: pointerX, clientY: pointerY } = event;
      const leftEye = leftEyeRef.current;
      const rightEye = rightEyeRef.current;

      if (!leftEye || !rightEye) return;

      const leftRect = leftEye.getBoundingClientRect();
      const rightRect = rightEye.getBoundingClientRect();
      const leftCenterX = leftRect.left + leftRect.width / 2;
      const leftCenterY = leftRect.top + leftRect.height / 2;
      const rightCenterX = rightRect.left + rightRect.width / 2;
      const rightCenterY = rightRect.top + rightRect.height / 2;
      const eyesCenterX = (leftCenterX + rightCenterX) / 2;
      const eyesCenterY = (leftCenterY + rightCenterY) / 2;
      const angle = Math.atan2(
        pointerY - eyesCenterY,
        pointerX - eyesCenterX,
      );
      const maxRadius = leftRect.width * 0.107;
      const transform = `translate(${Math.cos(angle) * maxRadius}px, ${
        Math.sin(angle) * maxRadius
      }px)`;

      leftEye.style.transform = transform;
      rightEye.style.transform = transform;
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return (
    <div className="relative aspect-[375/238] w-full overflow-hidden select-none md:aspect-[1440/823]">
      <img
        src="/images/hero/background-01.png"
        alt="Background"
        className="absolute inset-0 z-0 h-full w-full origin-center object-cover object-top will-change-transform motion-safe:animate-hero-zoom"
      />

      {/* 人物和眼球共用同一個等比例座標容器。 */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-[5] h-full aspect-[1097/823]">
        <img
          src="/images/hero/character-02.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain"
        />

        <div
          ref={leftEyeRef}
          className="absolute z-10 w-[5%] transition-transform duration-75 ease-out"
          style={{ top: '36.5%', left: '52%' }}
        >
          <img
            src="/images/hero/left-eye-container.png"
            alt="Left Eye"
            className="h-auto w-full"
          />
        </div>

        <div
          ref={rightEyeRef}
          className="absolute z-10 w-[5.1%] transition-transform duration-75 ease-out"
          style={{ top: '35.5%', left: '66.29%' }}
        >
          <img
            src="/images/hero/right-eye-container.png"
            alt="Right Eye"
            className="h-auto w-full"
          />
        </div>

        <img
          src="/images/hero/character-01.png"
          alt="Character"
          className="absolute inset-0 z-20 h-full w-full object-contain"
        />
      </div>

      <img
        src="/images/hero/logo-01.png"
        alt="Heelco Logo"
        className="pointer-events-none absolute left-[60.533%] top-[55.882%] z-30 h-auto w-[36.533%] md:left-[56.736%] md:top-[42.527%] md:w-[37.5%]"
      />
    </div>
  );
}

export default EyeTrackingHero;
