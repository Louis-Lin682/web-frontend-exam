import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import fetchJson from '../../utils/fetchJson';
import EyeTrackingHero from '../hero/EyeTrackingHero';
import JobDetailDialog from '../jobs/JobDetailDialog';
import JobResults from '../jobs/JobResults';
// PC端的分頁顯示6，手機則顯示4
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
function JobListPage() {
  const resultsRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
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
  // 切換手機與桌面版時，更新每頁筆數並重設頁碼；進入手機版時清除搜尋條件。
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
    return () => {
      mediaQuery.removeEventListener('change', handleBreakpointChange);
    };
  }, []);

  // 頁面首次掛載時，同時請求兩個互不依賴的下拉選單資料。
  // Promise.all 可並行載入，速度比依序等待兩支 API 更快。
  useEffect(() => {
    Promise.all([fetchJson('/api/v1/educationLevelList'), fetchJson('/api/v1/salaryLevelList')])
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

  const changePage = (nextPage) => {
    setPage(nextPage);

    // iPhone Safari 在最後一頁筆數較少、頁面高度縮短時，可能停在舊捲動位置。
    // 手機換頁後將結果區移回視窗頂端，避免短暫看到超出內容範圍的空白畫面。
    if (isMobile) {
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  };

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
      {/* 頁面頂端視覺：背景、人物、眼球跟隨 */}
      <EyeTrackingHero />

      <main className="relative z-10 mx-auto max-w-[1416px] px-0 md:mb-[-8rem] md:-translate-y-32 md:px-4">
        {/* Top Work 與搜尋面板屬於同一定位容器，確保兩者會一起移動。 */}
        <span className="absolute -top-6 left-0 text-caption font-bold text-white/40 md:-top-7 md:left-4">
          Top Work
        </span>
        <section className="flex flex-col gap-3 overflow-hidden bg-gray-100 p-4 md:gap-5 md:rounded-xl md:border md:border-gray-500 md:p-6 md:shadow-[2px_2px_4px_0px_#00000040]">
          {/* 搜尋表單：公司名稱、教育程度、薪資範圍及送出按鈕。 */}
          <form onSubmit={handleSearch} className="w-full shrink-0 md:-mx-px md:w-[calc(100%+2px)]">
            <h1 className="mb-3 flex items-center gap-2 text-gray-1000 md:mb-5 md:gap-3">
              <span aria-hidden="true" className="h-4 w-1 rounded-full bg-orange-700" />
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

              {/* 薪資選項，空字串代表不限其餘撈 API 資料 */}
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

              {/* submit 會統一發送請求 */}
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

          {/* 搜尋結果 */}
          <JobResults
            resultsRef={resultsRef}
            loading={loading}
            error={error}
            jobs={jobs}
            pageSize={pageSize}
            educationMap={educationMap}
            salaryMap={salaryMap}
            page={page}
            pageCount={pageCount}
            visiblePages={visiblePages}
            onChangePage={changePage}
            onOpenJob={setSelectedJob}
          />
        </section>
      </main>
      {/* selectedJob 為 null 時 Dialog 不渲染；有值時再請求完整職缺內容。 */}
      <JobDetailDialog job={selectedJob} onClose={closeDialog} />
    </div>
  );
}

export default JobListPage;
