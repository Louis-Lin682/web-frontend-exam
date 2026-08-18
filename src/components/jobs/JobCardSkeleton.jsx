import Skeleton from '@mui/material/Skeleton';

function JobCardSkeleton() {
  return (
    <div className="h-[210px] rounded-md border border-gray-500 bg-gray-100 p-4 md:h-full">
      {/* 公司與職缺資訊 */}
      <Skeleton animation="wave" height={30} width="42%" />
      <Skeleton animation="wave" height={22} width="58%" />
      <Skeleton animation="wave" height={22} width="28%" />
      <Skeleton animation="wave" height={22} width="36%" />

      {/* 職缺摘要 */}
      <div className="mt-2">
        <Skeleton animation="wave" height={20} width="100%" />
        <Skeleton animation="wave" height={20} width="94%" />
        <Skeleton animation="wave" height={20} width="70%" />
      </div>

      {/* 查看內容按鈕 */}
      <Skeleton animation="wave" className="mx-auto mt-2" height={24} width={64} />
    </div>
  );
}

export default JobCardSkeleton;
