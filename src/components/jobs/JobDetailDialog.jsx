import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Skeleton from '@mui/material/Skeleton';

function JobDetailDialog({ job, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);
  const [carouselDragX, setCarouselDragX] = useState(0);
  const [carouselTransition, setCarouselTransition] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const carouselDragRef = useRef(null);
  const closeTimerRef = useRef(null);

  const requestClose = useCallback(() => {
    if (closeTimerRef.current) return;
    setDialogVisible(false);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!job) return undefined;

    setLoading(true);
    setSlide(0);
    window.requestAnimationFrame(() => setDialogVisible(true));
    fetch(`/api/v1/jobs/${job.id}`)
      .then((response) => response.json())
      .then((data) => {
        setCarouselTransition(false);
        setDetail(data);
        setSlide(data.companyPhoto?.length || 0);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => setCarouselTransition(true));
        });
      })
      .finally(() => setLoading(false));

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') requestClose();
    };
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth
      - document.documentElement.clientWidth;
    const currentPaddingRight = Number.parseFloat(
      window.getComputedStyle(document.body).paddingRight,
    ) || 0;

    // 隱藏捲軸前補回相同寬度，避免彈窗開關時頁面水平跳動。
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [job, requestClose]);

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  }, []);

  const photos = detail?.companyPhoto || [];
  const trackPhotos = photos.length ? [...photos, ...photos, ...photos] : [];
  const trackWidth = trackPhotos.length * 250
    + Math.max(0, trackPhotos.length - 1) * 8;
  const slideOffset = slide * 258;
  const normalizedSlide = photos.length
    ? ((slide % photos.length) + photos.length) % photos.length
    : 0;
  const indicatorIndex = photos.length > 1
    ? Math.floor((normalizedSlide * 3) / photos.length)
    : 0;

  useEffect(() => {
    if (!job || photos.length < 2) return undefined;
    const timer = window.setInterval(() => {
      if (carouselDragRef.current) return;
      setSlide((current) => current + 1);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [job, photos.length]);

  if (!job) return null;

  const startCarouselDrag = (event) => {
    carouselDragRef.current = { pointerX: event.clientX };
    setCarouselTransition(false);
    setCarouselDragX(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveCarousel = (event) => {
    if (!carouselDragRef.current) return;
    const distance = event.clientX - carouselDragRef.current.pointerX;
    setCarouselDragX(Math.max(-100, Math.min(100, distance)));
  };

  const stopCarouselDrag = () => {
    if (!carouselDragRef.current) return;
    setCarouselTransition(true);
    if (carouselDragX <= -40) {
      setSlide((current) => current + 1);
    } else if (carouselDragX >= 40) {
      setSlide((current) => current - 1);
    }
    carouselDragRef.current = null;
    setCarouselDragX(0);
  };

  const normalizeCarousel = () => {
    if (!photos.length) return;
    if (slide >= photos.length * 2) {
      setCarouselTransition(false);
      setSlide((current) => current - photos.length);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setCarouselTransition(true));
      });
    } else if (slide < photos.length) {
      setCarouselTransition(false);
      setSlide((current) => current + photos.length);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setCarouselTransition(true));
      });
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ease-out ${dialogVisible ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-detail-title"
        className={`flex h-[calc(100vh-32px)] max-h-[768px] w-full max-w-[750px] flex-col overflow-hidden rounded bg-gray-100 shadow-[0_8px_24px_#00000040] transition-all duration-200 ease-out ${dialogVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.98]'}`}
      >
        <header className="border-b border-gray-400 px-6 py-4">
          <h2 id="job-detail-title" className="text-xl font-bold text-gray-1100">
            詳細資訊
          </h2>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 py-5">
          <p className="text-lg text-gray-1000">
            <strong className="mr-2 text-xl">{job.companyName}</strong>
            {job.jobTitle}
          </p>

          {loading && (
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              {/* 保留輪播的 702 × 166px 空間，避免圖片載入後內容向下跳動。 */}
              <div className="flex h-[166px] shrink-0 flex-col gap-[10px] overflow-hidden">
                <div className="flex h-[150px] w-[766px] gap-2">
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton
                      key={`dialog-image-skeleton-${index}`}
                      animation="wave"
                      variant="rectangular"
                      className="shrink-0"
                      height={150}
                      width={250}
                    />
                  ))}
                </div>
                <div className="flex h-1.5 items-center justify-center gap-2">
                  <Skeleton animation="wave" height={6} width={24} variant="rounded" />
                  <Skeleton animation="wave" height={6} width={6} variant="circular" />
                  <Skeleton animation="wave" height={6} width={6} variant="circular" />
                </div>
              </div>

              {/* 工作內容骨架模擬標題與段落，完成後由 API HTML 取代。 */}
              <div className="min-h-0 flex-1">
                <Skeleton animation="wave" height={30} width={88} />
                <Skeleton animation="wave" height={22} width="42%" />
                <Skeleton animation="wave" height={22} width="58%" />
                <div className="mt-3 space-y-1">
                  <Skeleton animation="wave" height={20} width="100%" />
                  <Skeleton animation="wave" height={20} width="96%" />
                  <Skeleton animation="wave" height={20} width="92%" />
                  <Skeleton animation="wave" height={20} width="98%" />
                  <Skeleton animation="wave" height={20} width="76%" />
                  <Skeleton animation="wave" height={20} width="88%" />
                </div>
              </div>
            </div>
          )}

          {!loading && photos.length > 0 && (
            <div className="flex h-[166px] w-full flex-col gap-[10px] overflow-hidden">
              <div
                className="h-[150px] w-full touch-pan-y overflow-hidden cursor-grab active:cursor-grabbing"
                onPointerDown={startCarouselDrag}
                onPointerMove={moveCarousel}
                onPointerUp={stopCarouselDrag}
                onPointerCancel={stopCarouselDrag}
              >
                <div
                  className={`flex h-full gap-2 ease-out ${carouselTransition ? 'transition-transform duration-300' : ''}`}
                  onTransitionEnd={normalizeCarousel}
                  style={{
                    width: `${trackWidth}px`,
                    transform: `translateX(${-slideOffset + carouselDragX}px)`,
                  }}
                >
                  {trackPhotos.map((photo, index) => (
                    <img
                      key={`${photo}-${index}`}
                      src={photo}
                      alt={`${job.companyName} 工作環境 ${index + 1}`}
                      draggable="false"
                      className="h-[150px] w-[250px] shrink-0 object-cover"
                    />
                  ))}
                </div>
              </div>
              <div className="flex h-1.5 w-full items-center justify-center gap-2">
                {Array.from({ length: 3 }, (_, index) => (
                  <button
                    key={`slide-dot-${index}`}
                    type="button"
                    aria-label={`顯示第 ${index + 1} 段圖片`}
                    onClick={() => {
                      const target = Math.round((index * (photos.length - 1)) / 2);
                      setSlide(photos.length + target);
                    }}
                    className={`h-1.5 rounded-[18px] transition-all ${index === indicatorIndex ? 'w-6 bg-orange-700' : 'w-1.5 bg-gray-500'}`}
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && detail && (
            <div className="min-h-0 flex-1 overflow-y-auto pr-2 text-sm leading-6 text-gray-900">
              <h3 className="mb-2 text-lg font-bold text-gray-1100">工作內容</h3>
              {/* The HTML comes from this project's local Mirage fixture. */}
              {/* eslint-disable-next-line react/no-danger */}
              <div dangerouslySetInnerHTML={{ __html: detail.description }} />
            </div>
          )}
        </div>

        <footer className="flex shrink-0 justify-end border-t border-gray-400 px-6 py-3">
          <button type="button" onClick={requestClose} className="text-sm text-gray-1000 hover:text-gray-1500">
            關閉
          </button>
        </footer>
      </section>
    </div>
  );
}

export default JobDetailDialog;
