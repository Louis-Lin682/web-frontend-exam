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

function JobCard({
  job, educationLabel, salaryLabel, onOpen, animationDelay,
}) {
  return (
    <article
      className="flex h-[210px] flex-col gap-2.5 overflow-hidden rounded-md border border-gray-500 bg-gray-100 p-4 transition-[transform,box-shadow] duration-200 ease-out motion-safe:animate-card-enter md:h-auto md:min-h-[210px] md:gap-0 md:hover:-translate-y-[3px] md:hover:shadow-[0_0_16px_0_#00000040]"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* 公司名稱 */}
      <h2 className="h-5 text-base font-bold leading-5 text-gray-1000 md:mb-2 md:h-auto md:text-xl md:leading-normal">
        {job.companyName}
      </h2>

      {/* 職缺基本資訊 */}
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

      {/* 職缺摘要 */}
      <p className="line-clamp-2 h-10 w-full text-sm leading-5 text-gray-1000 md:mt-2 md:h-auto md:line-clamp-3">
        {job.preview}
      </p>

      {/* 查看完整內容 */}
      <div className="relative h-[18px] w-full shrink-0 md:mt-auto md:h-[24px] md:pt-3">
        <button
          type="button"
          aria-label={`查看 ${job.companyName} ${job.jobTitle} 的詳細資訊`}
          onClick={() => onOpen(job)}
          className="absolute -inset-y-2 inset-x-0 cursor-pointer text-center text-sm font-bold leading-[18px] text-orange-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 md:inset-x-0 md:-bottom-2 md:top-1"
        >
          查看細節
        </button>
      </div>
    </article>
  );
}

export default JobCard;
