function JobPagination({
  ariaLabel, loading, page, pageCount, visiblePages, onChange,
}) {
  if (pageCount === 0) {
    return <div aria-hidden="true" className="mx-auto hidden h-8 w-[424px] md:block" />;
  }

  return (
    <nav
      aria-label={ariaLabel}
      aria-busy={loading}
      className="mx-auto mt-5 flex h-8 w-[310px] items-center justify-center gap-1.5 px-1.5 text-sm text-gray-1000 md:mt-0 md:w-[424px]"
    >
      {/* 上一頁 */}
      <button
        type="button"
        aria-label="上一頁"
        disabled={loading || page === 1}
        onClick={() => onChange(page - 1)}
        className="flex h-8 w-8 items-center justify-center rounded disabled:cursor-not-allowed disabled:text-gray-500"
      >
        <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center text-xl leading-5 md:text-base">
          ‹
        </span>
      </button>

      {/* 頁碼 */}
      {visiblePages.map((pageNumber) => (
        <button
          type="button"
          key={pageNumber}
          aria-current={pageNumber === page ? 'page' : undefined}
          disabled={loading}
          onClick={() => onChange(pageNumber)}
          className={`h-8 min-w-8 rounded-full px-2 disabled:cursor-wait ${pageNumber === page ? 'bg-gray-300 font-bold' : 'hover:bg-gray-200'}`}
        >
          {pageNumber}
        </button>
      ))}

      {/* 下一頁 */}
      <button
        type="button"
        aria-label="下一頁"
        disabled={loading || page === pageCount}
        onClick={() => onChange(page + 1)}
        className="flex h-8 w-8 items-center justify-center rounded disabled:cursor-not-allowed disabled:text-gray-500"
      >
        <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center text-xl leading-5 md:text-base">
          ›
        </span>
      </button>
    </nav>
  );
}

export default JobPagination;
