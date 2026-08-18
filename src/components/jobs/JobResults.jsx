import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';
import JobPagination from './JobPagination';

function JobResults({
  resultsRef,
  loading,
  error,
  jobs,
  pageSize,
  educationMap,
  salaryMap,
  page,
  pageCount,
  visiblePages,
  onChangePage,
  onOpenJob,
}) {
  let content;

  if (loading) {
    content = Array.from({ length: pageSize }, (_, index) => (
      <JobCardSkeleton key={`job-skeleton-${index}`} />
    ));
  } else {
    content = jobs.map((job, index) => (
      <JobCard
        key={job.id}
        job={job}
        educationLabel={educationMap[String(job.educationId)]}
        salaryLabel={salaryMap[String(job.salaryId)]}
        onOpen={onOpenJob}
        animationDelay={index * 50}
      />
    ));
  }

  return (
    <div ref={resultsRef} className="min-h-[430px] w-full md:-mx-px md:w-[calc(100%+2px)]">
      {/* 載入失敗 */}
      {!loading && error && (
        <div className="flex min-h-[380px] items-center justify-center text-red-800">{error}</div>
      )}

      {/* 沒有符合條件的職缺 */}
      {!loading && !error && jobs.length === 0 && (
        <div className="flex min-h-[380px] items-center justify-center rounded border border-gray-500 text-gray-600 md:h-[458px] md:min-h-0">
          無資料
        </div>
      )}

      {/* 職缺列表 */}
      {!error && (loading || jobs.length > 0) && (
        <div className="flex h-full flex-col md:gap-3 xl:h-[502px]">
          {/* 卡片內容 */}
          <div className="grid min-h-[876px] flex-1 content-start gap-3 md:min-h-0 md:grid-cols-2 md:gap-[18px] xl:h-[458px] xl:flex-none xl:grid-cols-3 xl:grid-rows-2">
            {content}
          </div>

          {/* 分頁 */}
          <JobPagination
            ariaLabel="職缺分頁"
            loading={loading}
            page={page}
            pageCount={jobs.length > 0 ? pageCount : 0}
            visiblePages={visiblePages}
            onChange={onChangePage}
          />
        </div>
      )}
    </div>
  );
}

export default JobResults;
