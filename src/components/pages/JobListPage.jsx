import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import { useCallback, useEffect, useState } from 'react';
import fetchJson from '../../utils/fetchJson';
import EyeTrackingHero from '../hero/EyeTrackingHero';
import JobDetailDialog from '../jobs/JobDetailDialog';
// PC端的分頁顯示6
const MOBILE_PAGE_SIZE = 4;
const DESKTOP_PAGE_SIZE = 6;
// 搜尋欄樣式
const fieldSx = {
  '&:hover .MuiInputLabel-root': { color: '#666666' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#666666' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#CCCCCC' },
    '&:hover fieldset': { borderColor: '#CCCCCC', borderWidth: 1 },
    '&.Mui-focused fieldset': { borderColor: '#CCCCCC', borderWidth: 1 },
  },
};
// 根據 type 顯示不同的 icon
function Icon({ type }) {
  const paths = {
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 4H11v15H7.5A3.5 3.5 0 0 0 4 20.5z" />
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 4H13v15h3.5a3.5 3.5 0 0 1 3.5 1.5z" />
      </>
    ),
    salary: (
      <>
        <path d="M12 2v20M16 6.5c-.8-1-2.1-1.5-4-1.5-2.2 0-4 1.2-4 3s1.5 2.6 4 3c2.5.4 4 1.2 4 3s-1.8 3-4 3c-1.9 0-3.3-.6-4.2-1.7" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[type]}
    </svg>
  );
}
// prettier-ignore
// ：避免 Prettier 與 Airbnb 的參數解構換行規則互相衝突。
function JobCard({
  job, educationLabel, salaryLabel, onOpen,
}) {
  return (
    <article
      className="flex h-[210px] flex-col gap-2.5 overflow-hidden rounded-md border border-gray-500 bg-gray-100 p-4 transition-shadow duration-200 ease-out hover:shadow-[0_0_6px_0_#00000040] md:h-auto md:min-h-[210px] md:gap-0"
    >
      {/* 公司名稱 */}
      <h2 className="h-5 text-base font-bold leading-5 text-gray-1000 md:mb-2 md:h-auto md:text-xl md:leading-normal">
        {job.companyName}
      </h2>
      {/* 職稱 學歷與薪資共用 Icon 元件，type 決定要顯示的圖案 */}
      <div className="flex h-[70px] w-full flex-col gap-2 text-xs leading-[18px] text-gray-800 md:block md:h-auto md:space-y-1 md:text-sm md:leading-normal">
        <p className="flex h-[18px] items-center gap-1.5 md:h-auto">
          <Icon type="user" />
          {job.jobTitle}
        </p>
        <p className="flex h-[18px] items-center gap-1.5 md:h-auto">
          <Icon type="book" />
          {educationLabel || '不限'}
        </p>
        <p className="flex h-[18px] items-center gap-1.5 md:h-auto">
          <Icon type="salary" />
          {salaryLabel || '薪水範圍'}
        </p>
      </div>
      {/* 列表只顯示preview */}
      <p className="line-clamp-2 h-10 w-full text-sm leading-5 text-gray-1000 md:mt-2 md:h-auto md:line-clamp-3">
        {job.preview}
      </p>
      {/*
        只有這個按鈕會開啟詳情彈框，避免使用者只是選取卡片文字時誤觸。
        外層維持設計稿指定的文字列高度；按鈕使用負 margin 向上下延伸，
        因此畫面尺寸不變，但滑鼠與觸控裝置會有更大的實際點擊範圍。
      */}
      <div className="relative h-[18px] w-full shrink-0 md:mt-auto md:h-[24px] md:pt-3">
        <button
          type="button"
          aria-label={`查看 ${job.companyName} ${job.jobTitle} 的詳細資訊`}
          onClick={() => onOpen(job)}
          className="absolute -inset-y-2 inset-x-0 cursor-pointer text-center text-sm font-bold leading-[18px] text-orange-700 transition-colors hover:text-orange-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 md:inset-x-0 md:-bottom-2 md:top-1"
        >
          查看細節
        </button>
      </div>
    </article>
  );
}

// 搜尋時顯示的骨架卡片，避免畫面跳動
function JobCardSkeleton() {
  return (
    <div className="h-[210px] rounded-md border border-gray-500 bg-gray-100 p-4 md:h-full">
      <Skeleton animation="wave" height={30} width="42%" />
      <Skeleton animation="wave" height={22} width="58%" />
      <Skeleton animation="wave" height={22} width="28%" />
      <Skeleton animation="wave" height={22} width="36%" />
      <div className="mt-2">
        <Skeleton animation="wave" height={20} width="100%" />
        <Skeleton animation="wave" height={20} width="94%" />
        <Skeleton animation="wave" height={20} width="70%" />
      </div>
      <Skeleton
        animation="wave"
        className="mx-auto mt-2"
        height={24}
        width={64}
      />
    </div>
  );
}

function JobListPage() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 767px)').matches,
  );
  const pageSize = isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
  // 表單輸入值：使用者修改欄位時立即更新，但尚未送出 API 搜尋。
  const [companyName, setCompanyName] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [salaryLevel, setSalaryLevel] = useState('');

  // 已套用的搜尋條件：只有按下「條件搜尋」後才會更新並重新請求資料，避免使用者每打一個字就呼叫一次 API
  const [appliedFilters, setAppliedFilters] = useState({
    companyName: '',
    educationLevel: '',
    salaryLevel: '',
  });
  // 下拉選單資料，學歷/薪資 API 載入。
  const [educationOptions, setEducationOptions] = useState([]);
  const [salaryOptions, setSalaryOptions] = useState([]);

  // 職缺列表、符合條件的總筆數，以及目前頁碼。
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // 非同步請求的畫面狀態。
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterError, setFilterError] = useState('');

  // 使用者選擇的卡片，關閉則設為null
  const [selectedJob, setSelectedJob] = useState(null);

  // useCallback 保持函式參考穩定，避免彈框的 effect 不必要地重新執行
  const closeDialog = useCallback(() => setSelectedJob(null), []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleBreakpointChange = (event) => {
      setIsMobile(event.matches);
      setPage(1);
      if (event.matches) {
        setAppliedFilters({
          companyName: '',
          educationLevel: '',
          salaryLevel: '',
        });
      }
    };

    mediaQuery.addEventListener('change', handleBreakpointChange);
    return () => mediaQuery.removeEventListener('change', handleBreakpointChange);
  }, []);

  // 頁面首次掛載時，同時請求兩個互不依賴的下拉選單資料。
  // Promise.all 可並行載入，速度比依序等待兩支 API 更快。
  useEffect(() => {
    Promise.all([
      fetchJson('/api/v1/educationLevelList'),
      fetchJson('/api/v1/salaryLevelList'),
    ])
      .then(([educationData, salaryData]) => {
        setEducationOptions(Array.isArray(educationData) ? educationData : []);
        setSalaryOptions(Array.isArray(salaryData) ? salaryData : []);
      })
      .catch(() => setFilterError('篩選條件載入失敗，請稍後再試。'));
  }, []);

  const loadJobs = useCallback(
    async (signal) => {
      // 每次發送請求前清除舊錯誤，並切換成載入中畫面。
      setLoading(true);
      setError('');

      // API 使用 pre_page 與 page 進行後端分頁；每頁固定顯示六筆。
      const params = new URLSearchParams({ pre_page: pageSize, page });

      // 空白條件不放進 query string，讓 Mirage API 視為「不限」。
      if (appliedFilters.companyName) {
        params.set('company_name', appliedFilters.companyName);
      }
      if (appliedFilters.educationLevel) {
        params.set('education_level', appliedFilters.educationLevel);
      }
      if (appliedFilters.salaryLevel) {
        params.set('salary_level', appliedFilters.salaryLevel);
      }

      try {
        const result = await fetchJson(`/api/v1/jobs?${params.toString()}`, {
          signal,
        });

        // 防止 API 欄位缺漏導致 render 時呼叫 map 失敗。
        setJobs(Array.isArray(result.data) ? result.data : []);
        // total 必須是非負數；異常值統一視為 0，避免分頁算出 NaN 或負頁數。
        const safeTotal = Number(result.total);
        setTotal(Number.isFinite(safeTotal) && safeTotal >= 0 ? safeTotal : 0);
      } catch (requestError) {
        // 條件或頁碼改變時會主動取消舊請求；取消不應顯示成 API 錯誤。
        if (requestError.name === 'AbortError') return;

        // 請求失敗時清空舊資料，避免畫面保留不符合目前條件的內容。
        setJobs([]);
        setTotal(0);
        setError('職缺資料載入失敗，請稍後再試。');
      } finally {
        // 已取消的舊請求不可關閉較新請求的 Skeleton。
        if (!signal.aborted) setLoading(false);
      }
    },
    [appliedFilters, page, pageSize],
  );

  // loadJobs 會在切頁或搜尋條件改變後更新，因此 effect 會重新載入列表。
  useEffect(() => {
    const controller = new AbortController();
    loadJobs(controller.signal);

    // 切頁、重新搜尋或卸載頁面時，取消上一個尚未完成的列表請求。
    return () => controller.abort();
  }, [loadJobs]);

  // 送出表單時，自動切回第一頁，並套用目前欄位值作為搜尋條件
  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({
      companyName: companyName.trim(),
      educationLevel,
      salaryLevel,
    });
  };

  // 總頁數至少保留 1，避免無資料時出現 0 頁造成分頁計算異常。
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const visiblePageCount = isMobile ? 6 : 9;
  const firstVisiblePage = Math.min(
    Math.max(1, page - Math.floor(visiblePageCount / 2)),
    Math.max(1, pageCount - visiblePageCount + 1),
  );
  const visiblePages = Array.from(
    { length: Math.min(visiblePageCount, pageCount) },
    (_, index) => firstVisiblePage + index,
  );

  // 建立「ID 對應顯示名稱」的資料表，讓卡片能將 educationId 和 salaryId 轉成文字。
  const educationMap = Object.fromEntries(
    educationOptions.map((item) => [String(item.id), item.label]),
  );
  const salaryMap = Object.fromEntries(
    salaryOptions.map((item) => [String(item.id), item.label]),
  );

  return (
    <div
      className="min-h-screen overflow-x-hidden pb-8 md:pb-12"
      style={{
        background: 'linear-gradient(90.51deg, #868686 1.54%, #5C5C5C 101.46%)',
      }}
    >
      {/* 頁面頂端視覺：背景、人物、眼睛跟隨滑鼠與品牌 Logo。 */}
      <EyeTrackingHero />

      <main className="relative z-10 mx-auto max-w-[1416px] px-0 md:mb-[-8rem] md:-translate-y-32 md:px-4">
        {/* Top Work 與搜尋面板屬於同一定位容器，確保兩者會一起移動。 */}
        <span className="absolute -top-6 left-0 text-caption font-bold text-white/40 md:-top-7 md:left-4">
          Top Work
        </span>
        <section className="flex flex-col gap-3 overflow-hidden bg-gray-100 p-4 md:gap-5 md:rounded-xl md:border md:border-gray-500 md:p-6 md:shadow-[2px_2px_4px_0px_#00000040]">
          {/* 搜尋表單：公司名稱、教育程度、薪資範圍及送出按鈕。 */}
          <form
            onSubmit={handleSearch}
            className="w-full shrink-0 md:-mx-px md:w-[calc(100%+2px)]"
          >
            <h1 className="mb-3 flex items-center gap-2 text-gray-1000 md:mb-5 md:gap-3">
              <span
                aria-hidden="true"
                className="h-4 w-1 rounded-full bg-orange-700"
              />
              <span className="text-base font-bold leading-6 tracking-normal md:text-[24px] md:leading-[30px]">
                適合前端工程師的好工作
              </span>
            </h1>

            <div className="hidden gap-[18px] md:grid md:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)_minmax(0,1fr)_108px] md:items-end min-[1416px]:grid-cols-[647px_263.5px_263.5px_108px]">
              <TextField
                className="min-w-0"
                fullWidth
                label="公司名稱"
                placeholder="請輸入公司名稱"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
                variant="outlined"
              />
              <FormControl className="min-w-0" fullWidth sx={fieldSx}>
                <InputLabel shrink id="education-level-label">
                  教育程度
                </InputLabel>
                <Select
                  displayEmpty
                  input={<OutlinedInput label="教育程度" notched />}
                  label="教育程度"
                  labelId="education-level-label"
                  value={educationLevel}
                  onChange={(event) => setEducationLevel(event.target.value)}
                >
                  <MenuItem value="">不限</MenuItem>
                  {educationOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 薪資選項，空字串代表其餘撈 API 資料 */}
              <FormControl className="min-w-0" fullWidth sx={fieldSx}>
                <InputLabel shrink id="salary-level-label">
                  薪水範圍
                </InputLabel>
                <Select
                  displayEmpty
                  input={<OutlinedInput label="薪水範圍" notched />}
                  label="薪水範圍"
                  labelId="salary-level-label"
                  value={salaryLevel}
                  onChange={(event) => setSalaryLevel(event.target.value)}
                >
                  <MenuItem value="">不限</MenuItem>
                  {salaryOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* submit 會統一由 form 的 handleSearch 處理，不直接發送請求。 */}
              <button
                type="submit"
                className="h-14 whitespace-nowrap rounded bg-gray-700 px-[22px] py-2 text-sm font-bold text-gray-100 transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700 focus:ring-offset-2"
              >
                條件搜尋
              </button>
            </div>
            {filterError && (
              <p className="mt-2 text-sm text-red-800" role="alert">
                {filterError}
              </p>
            )}
          </form>

          <div className="min-h-[430px] w-full md:-mx-px md:w-[calc(100%+2px)]">
            {/* 請求失敗時顯示錯誤訊息 */}
            {!loading && error && (
              <div className="flex min-h-[380px] items-center justify-center text-red-800">
                {error}
              </div>
            )}
            {/* 請求成功但沒有符合條件的職缺時顯示空狀態。 */}
            {!loading && !error && jobs.length === 0 && (
              <div className="flex min-h-[380px] items-center justify-center rounded border border-gray-500 text-gray-600 md:h-[458px] md:min-h-0">
                無資料
              </div>
            )}

            {/*
              初次載入與切頁都以卡片 Skeleton 保持版面穩定。
              已取得過資料後，切頁期間仍保留分頁列並暫停操作，避免整列閃爍消失。
            */}
            {!error && (loading || jobs.length > 0) && (
              <div className="flex h-full flex-col md:gap-3 xl:h-[502px]">
                <div className="grid flex-1 gap-3 md:grid-cols-2 md:gap-[18px] xl:h-[458px] xl:flex-none xl:grid-cols-3 xl:grid-rows-2">
                  {loading
                    ? Array.from({ length: pageSize }, (_, index) => (
                        <JobCardSkeleton key={`job-skeleton-${index}`} />
                    ))
                    : jobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          educationLabel={educationMap[String(job.educationId)]}
                          salaryLabel={salaryMap[String(job.salaryId)]}
                          onOpen={setSelectedJob}
                        />
                    ))}
                </div>

                {/*
                  分頁列固定為 424 × 32px，左右 padding 與項目 gap 都是 6px。
                  aria-current 讓輔助工具能辨識目前頁碼。
                */}
                {jobs.length > 0 ? (
                  <nav
                    aria-label="職缺分頁"
                    aria-busy={loading}
                    className="mx-auto mt-5 flex h-10 w-full items-center justify-center gap-1.5 px-1.5 text-sm text-gray-1000 md:mt-0 md:h-8 md:w-[424px]"
                  >
                    <button
                      type="button"
                      aria-label="上一頁"
                      disabled={loading || page === 1}
                      onClick={() => setPage((current) => current - 1)}
                      className="h-8 w-8 rounded disabled:cursor-not-allowed disabled:text-gray-500"
                    >
                      ‹
                    </button>
                    {visiblePages.map((pageNumber) => (
                      <button
                        type="button"
                        key={pageNumber}
                        aria-current={pageNumber === page ? 'page' : undefined}
                        disabled={loading}
                        onClick={() => setPage(pageNumber)}
                        className={`h-8 min-w-8 rounded-full px-2 disabled:cursor-wait ${pageNumber === page ? 'bg-gray-300 font-bold' : 'hover:bg-gray-200'}`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label="下一頁"
                      disabled={loading || page === pageCount}
                      onClick={() => setPage((current) => current + 1)}
                      className="h-8 w-8 rounded disabled:cursor-not-allowed disabled:text-gray-500"
                    >
                      ›
                    </button>
                  </nav>
                ) : (
                  // 首次載入還不知道總頁數，只保留桌面版分頁高度避免畫面跳動。
                  <div
                    aria-hidden="true"
                    className="mx-auto hidden h-8 w-[424px] md:block"
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      {/* selectedJob 為 null 時 Dialog 不渲染；有值時再請求完整職缺內容。 */}
      <JobDetailDialog job={selectedJob} onClose={closeDialog} />
    </div>
  );
}

export default JobListPage;
