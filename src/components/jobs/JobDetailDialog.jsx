import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Skeleton from '@mui/material/Skeleton';
import fetchJson from '../../utils/fetchJson';

function JobDetailDialog({ job, onClose }) {
  // detail 保存使用者所選職缺的完整資料；列表卡片只提供摘要資訊。
  const [detail, setDetail] = useState(null);
  // loading 與 detailError 分開管理，讓骨架、錯誤提示與正式內容互斥顯示。
  const [loading, setLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  // 點擊「重新載入」時遞增此值，藉由 effect 相依值重新發送同一筆請求。
  const [reloadKey, setReloadKey] = useState(0);
  const [slide, setSlide] = useState(0);
  const [carouselDragX, setCarouselDragX] = useState(0);
  const [carouselTransition, setCarouselTransition] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const carouselDragRef = useRef(null);
  const closeTimerRef = useRef(null);

  // 先播放 200ms 的淡出動畫，動畫結束後才通知父元件清除 selectedJob。
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

    // 每次切換職缺或重新載入，都建立獨立的 AbortController。
    // 若彈框提前關閉，cleanup 會取消尚未完成的請求，避免卸載後繼續更新狀態。
    const controller = new AbortController();
    setLoading(true);
    setDetail(null);
    setDetailError('');
    setSlide(0);
    window.requestAnimationFrame(() => setDialogVisible(true));
    fetchJson(`/api/v1/jobs/${job.id}`, { signal: controller.signal })
      .then((data) => {
        // API 成功後將輪播定位在中間那組複製圖片，供無限輪播向兩側移動。
        setCarouselTransition(false);
        setDetail(data);
        setSlide(data.companyPhoto?.length || 0);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => setCarouselTransition(true));
        });
      })
      .catch((requestError) => {
        // 主動取消請求不算載入錯誤；只有真正的網路或 HTTP 錯誤才顯示提示。
        if (requestError.name !== 'AbortError') {
          setDetailError('詳細資料載入失敗，請稍後再試。');
        }
      })
      .finally(() => {
        // 已取消的舊請求不可覆蓋新請求的 loading 狀態。
        if (!controller.signal.aborted) setLoading(false);
      });

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
      controller.abort();
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [job, reloadKey, requestClose]);

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
      className={`fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 px-4 pb-4 pt-[220px] transition-opacity duration-200 ease-out md:items-center md:overflow-hidden md:p-4 ${dialogVisible ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-detail-title"
        className={`flex h-[768px] w-full max-w-[331px] shrink-0 flex-col overflow-hidden rounded bg-gray-100 shadow-[0px_11px_15px_-7px_#00000033,0px_24px_38px_3px_#00000024,0px_9px_46px_8px_#0000001F] transition-all duration-200 ease-out md:h-[calc(100vh-32px)] md:max-h-[768px] md:max-w-[750px] ${dialogVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.98]'}`}
      >
        <header className="border-b border-gray-400 px-4 py-3 md:px-6 md:py-4">
          <h2 id="job-detail-title" className="text-base font-bold text-gray-1100 md:text-xl">
            詳細資訊
          </h2>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 md:px-6 md:py-5">
          <p className="text-sm text-gray-1000 md:text-lg">
            <strong className="mr-2 text-base md:text-xl">{job.companyName}</strong>
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

          {!loading && detailError && (
            <div
              className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center"
              role="alert"
            >
              <p className="text-sm text-red-800">{detailError}</p>
              <button
                type="button"
                className="rounded bg-gray-700 px-4 py-2 text-sm font-bold text-white hover:bg-gray-900"
                onClick={() => setReloadKey((current) => current + 1)}
              >
                重新載入
              </button>
            </div>
          )}

          {!loading && !detailError && photos.length > 0 && (
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

          {!loading && !detailError && detail && (
            <div className="min-h-0 flex-1 overflow-y-auto pr-2 text-sm leading-6 text-gray-900">
              <h3 className="mb-2 text-base font-bold text-gray-1100 md:text-lg">工作內容</h3>
              {/* The HTML comes from this project's local Mirage fixture. */}
              {/* eslint-disable-next-line react/no-danger */}
              <div dangerouslySetInnerHTML={{ __html: detail.description }} />
            </div>
          )}
        </div>

        <footer className="flex shrink-0 justify-end border-t border-gray-400 px-4 py-3 md:px-6">
          <button type="button" onClick={requestClose} className="text-sm text-gray-1000 hover:text-gray-1500">
            關閉
          </button>
        </footer>
      </section>
    </div>
  );
}

export default JobDetailDialog;
