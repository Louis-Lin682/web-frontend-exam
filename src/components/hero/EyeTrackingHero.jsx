import { useEffect, useRef } from 'react';

function EyeTrackingHero() {
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const { clientX: mouseX, clientY: mouseY } = event;
      const leftEye = leftEyeRef.current;
      const rightEye = rightEyeRef.current;

      if (!leftEye || !rightEye) return;

      const leftRect = leftEye.getBoundingClientRect();
      const rightRect = rightEye.getBoundingClientRect();

      // 以兩眼之間的中心點計算一次方向，確保兩隻眼睛同步移動。
      const eyesCenterX = (
        leftRect.left + leftRect.width / 2
        + rightRect.left + rightRect.width / 2
      ) / 2;
      const eyesCenterY = (
        leftRect.top + leftRect.height / 2
        + rightRect.top + rightRect.height / 2
      ) / 2;
      const angle = Math.atan2(
        mouseY - eyesCenterY,
        mouseX - eyesCenterX,
      );

      // 位移量跟著眼球寬度縮放，讓不同螢幕的移動比例一致。
      const maxRadius = leftRect.width * 0.107;
      const transform = `translate(${Math.cos(angle) * maxRadius}px, ${
        Math.sin(angle) * maxRadius
      }px)`;

      leftEye.style.transform = transform;
      rightEye.style.transform = transform;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full aspect-[1440/823] overflow-hidden select-none">
      {/* 雪山背景 */}
      <img
        src="/images/hero/background-01.jpg"
        alt="Background"
        className="absolute inset-0 z-0 h-full w-full origin-center object-cover object-top will-change-transform motion-safe:animate-hero-zoom"
      />

      <div className="absolute bottom-0 left-0 z-[5] h-full aspect-[1097/823] pointer-events-none">
        <img
          src="/images/hero/character-02.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* 眼球位置與尺寸皆以人物座標容器為基準。 */}
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

        {/* 上層人物圖遮住眼球超出眼眶的區域。 */}
        <img
          src="/images/hero/character-01.png"
          alt="Character"
          className="absolute inset-0 z-20 h-full w-full object-contain"
        />
      </div>

      {/* Logo */}
      <img
        src="/images/hero/logo-01.png"
        alt="Heelco Logo"
        className="absolute z-30 h-auto w-[37.5%] pointer-events-none"
        style={{ top: '42.527%', left: '56.736%' }}
      />
    </div>
  );
}

export default EyeTrackingHero;
