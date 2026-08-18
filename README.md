# Frontend Engineer Exam

依照 Yile 前端工程師測驗的 Figma 設計稿完成職缺搜尋頁，並使用 Mirage JS 模擬題目提供的 API。

## 專案成果

本專案完成以下功能：

- 公司名稱、教育程度與薪資條件搜尋
- 手機版每頁 4 筆、桌面版每頁 6 筆的響應式分頁
- 載入中 Skeleton、空資料及 API 錯誤狀態
- 延遲載入職缺詳情、錯誤重試及公司圖片輪播
- 支援滑鼠及觸控操作的 Hero 眼球跟隨效果
- 手機版 Dialog 置中、內容捲動及鍵盤關閉

## 使用技術

- React 18
- Material UI
- Tailwind CSS
- Mirage JS
- React Testing Library
- ESLint（Airbnb JavaScript Style Guide）

## 如何執行

建議使用 Node.js 18 以上版本。

```bash
# 安裝依賴
npm install

# 啟動開發環境
npm start
```

啟動後開啟 [http://localhost:3000](http://localhost:3000)。Mirage JS 會在瀏覽器中攔截 API 請求，因此不需要另外啟動後端服務。

## 可用指令

```bash
npm start                      # 啟動開發環境
npm run lint                   # 使用 ESLint 檢查 src
npm test -- --watchAll=false   # 執行一次完整測試
npm run build                  # 建立正式版本
```

## 專案架構

```text
src/
├── .eslintrc.json                 # Airbnb 規則與專案例外設定
├── components/
│   ├── hero/
│   │   └── EyeTrackingHero.jsx    # Hero 視覺與眼球跟隨效果
│   ├── jobs/
│   │   ├── JobCard.jsx            # 單筆職缺卡片
│   │   ├── JobCardSkeleton.jsx    # 列表載入狀態
│   │   ├── JobDetailDialog.jsx    # 詳情請求、彈框與圖片輪播
│   │   ├── JobPagination.jsx      # 分頁操作
│   │   └── JobResults.jsx         # 組合列表的各種畫面狀態
│   └── pages/
│       └── JobListPage.jsx        # 搜尋、分頁與列表資料狀態
├── constants/                     # Mirage JS 使用的模擬資料
├── utils/
│   └── fetchJson.js               # 共用 JSON 請求與 HTTP 錯誤處理
├── App.js
└── index.js                       # Mirage JS API 與 React 進入點
```

## 實作邏輯

### 設計樣式設定

將設計稿使用的橘、紅與灰色階，以及文字大小統一設定在 `tailwind.config.js`。元件透過 `text-caption`、`text-gray-1000`、`bg-orange-700` 等 class 使用相同規格。

### 搜尋條件與列表請求

`JobListPage` 將表單輸入值與已套用的搜尋條件分開管理，只有送出表單才會重新請求資料，避免每次輸入都呼叫 API。頁碼或搜尋條件改變時會以 `AbortController` 取消前一次請求，避免較舊的結果覆蓋目前畫面。

### 響應式分頁

透過 `matchMedia` 監聽 `767px` 斷點。手機版每頁顯示 4 筆、桌面版每頁顯示 6 筆；跨越斷點時會回到第一頁。手機切頁後則將畫面捲回結果區頂端。

### 畫面狀態

`JobResults` 集中處理載入、錯誤、空資料與正常列表。載入期間由 `JobCardSkeleton` 保留卡片高度，並將分頁操作暫時停用，減少切頁時的版面跳動與重複操作。

### 職缺詳情

點擊「查看細節」後，`JobDetailDialog` 才依職缺 ID 載入完整內容。Dialog 包含 Skeleton、錯誤重試、圖片失敗狀態、循環輪播及拖曳操作，也支援背景點擊與 `Escape` 關閉。手機版使用動態視窗高度，避免瀏覽器工具列使彈框超出畫面。手機與桌面版皆加入縮放進退場效果，並依畫面尺寸調整開啟時的旋轉幅度。

### 眼球跟隨效果

`EyeTrackingHero` 使用 Pointer Events 同時支援滑鼠與觸控。程式會取得兩眼位置，從雙眼中心計算指標方向，再依眼睛尺寸限制位移半徑。

## 遇到的問題與解決方式

### iOS Safari 末頁高度縮短

手機版進入最後一頁時，職缺數量可能少於每頁設定的 4 筆。此情況在 Android 只會顯示剩餘卡片，但 iOS Safari 會將列表高度依實際內容收縮，使分頁向上移動並在下方留下大面積空白。列表因此保留四張卡片所需的最小高度，並讓現有卡片由頂部開始排列，使 iOS 的末頁版面與其他頁面保持一致。

### 圖片輪播循環時的跳動

輪播從最後一張回到第一張時，直接重設索引會出現反方向滑動或瞬間跳動。實作時將圖片複製成三組，讓輪播先在中間區段持續移動；抵達外側區段後暫時關閉 transition，將索引校正回相同內容的位置，再於下一個畫面更新重新開啟動畫。拖曳時也會暫停自動播放，避免手動與自動播放互相衝突。

### 搜尋條件與 API 請求

若直接將輸入欄位作為請求依賴，每次輸入都會重新載入資料。將輸入值與查詢條件分開，並在新請求開始前取消舊請求，降低不必要的載入與非同步競態問題。

---

## 📋 原始題目需求

### 框架

1. 語言：Javascript
2. Framework：
   1. 建議使用 React.js / Next.js，使用 Vue.js 亦可接受

### CSS

可以選擇以下其一或者搭配做為使用

1. [Material UI](https://mui.com/material-ui/)
2. [Sass](https://sass-lang.com/)
3. [Tailwindcss](https://tailwindcss.com/)

### Coding Style

採用 [Google Coding Style](https://google.github.io/styleguide/) 或 [Airbnb Style](https://github.com/airbnb/javascript)，我們將會審查你的程式碼是否符合風格規範

## 📝 實作描述

- 請 Fork 此專案做開發
- 根據 [Figma](https://www.figma.com/file/VcTqAK0x3JBi9nMvqN9YXJ/Web-Frontend-Developer-Exam?type=design&node-id=0%3A1&mode=design&t=EAnp3AAU1aqJ66e2-1) 實作頁面，請 `登入` 帳號才可看到實作細節
- 若有任何優化、更好方式請自由發揮，但確保基本功能皆有達成需求

## ✅ 提交說明

1. 請將專案上傳至 Github，提交 Repositories 連結給 HR，我們將會閱讀你的程式碼
2. 請提供一份 README 文件說明
   1. 如何執行此專案
   2. 專案架構、邏輯說明
   3. 專案遇到的困難、問題及解決方法
3. 請回傳給 HR，內容需包含 Github Repositories Link

## 🥇 加分項目

- 加載資料時的過渡表現
- 細節動畫表現
- 部署至任一平台以供成果檢視，例如：Heroku、AWS S3、GCS、Github Page …… 等

## ⚠️ 注意事項

- 素材為本公司內部所有，除此次線上考使用，請勿另用他途。

## ⚙️ API

### Job List [GET] `/api/v1/jobs`

工作列表

**Parameter**

| Name | Description |
| ---------------- | -------------- |
| pre_page         | 每頁顯示筆數     |
| page             | 指定頁面頁數     |
| company_name     | 公司名稱        |
| education_level  | 教育程度 id     |
| salary_level     | 薪資範圍 id     |

**Response**

```json
{
  "data": [
    {
      "id": "1",
      "companyName": "立刻科技",
      "jobTitle": "資深前端工程師",
      "educationId": 4,
      "salaryId": 3,
      "preview": "招募經驗豐富的前端工程師，共創卓越網頁體驗！",
    }
  ],
  "total": 1
}
```

---

### Education Level List [GET] `/api/v1/educationLevelList`

教育程度列表

**Response**

```json
[
  {
     "id": "1", "label": "國小"
  },
  {
     "id": "2", "label": "國中"
  },
  {
     "id": "3", "label": "高中"
  },
  {
     "id": "4", "label": "大學"
  },
  {
     "id": "5", "label": "碩士"
  },
  {
     "id": "6", "label": "博士"
  }
]
```

---

### Salary Level List [GET] `/api/v1/salaryLevelList`

薪資範圍列表

**Response**

```json
[
  {
    "id": "1", "label": "待遇面議"
  },
  {
    "id": "2", "label": "月薪 40,000 ~ 60,000 元"
  },
  {
    "id": "3", "label": "月薪 70,000 ~ 100,000 元"
  },
  {
    "id": "4", "label": "年薪 800,000 ~ 1,000,000 元"
  },
  {
    "id": "5", "label": "年薪 800,000 ~ 1,500,000 元"
  },
  {
    "id": "6", "label": "年薪 1,500,000 ~ 2,000,000 元"
  },
  {
    "id": "7", "label": "年薪 2,000,000 ~ 2,500,000 元"
  }
]
```

---

### Job [GET] `/api/v1/jobs/:id`

單一工作資訊

**Response**

```json
{
  "id": "6",
  "description": "<h1>貨運操作員</h1><h2>工作地點：公司總部 - 台北市</h2><h2>職責與要求</h2><ul><li>負責倉儲內的物品搬運、分裝、包裝及出貨作業，確保貨物的準確性和完整性。<br />遵循公司的作業流程和安全規範，保障倉庫內的工作環境。<br />與團隊成員合作，確保倉儲操作的順暢進行。<br />需具備基本的電腦操作能力，能使用相關SaaS系統進行庫存管理。<br />需要有良好的溝通協調能力，能有效地與其他部門合作，確保整體物流運作的協調性。<br />對倉儲物流行業有興趣，願意學習並接受公司提供的培訓。</li></ul><h2>資格</h2><ul><li>至少高中畢業，具備相關物流或倉儲操作經驗者優先考慮。<br />具有貨運相關證照者尤佳。<br />對工作積極負責，有良好的工作態度和團隊協作精神。<br />願意接受輪班工作，能夠適應倉儲作業的體力需求。</li></ul><h2>我們提供</h2><ul><li>充滿挑戰性的工作環境，與國際化的專業團隊一同合作。<br />完善的培訓體系，協助您提升相關技能和知識。<br />良好的晉升機會，公司快速發展將為您提供更多職涯發展空間。<br />公司福利包括勞健保、團體保險、員工餐飲補助等。</li></ul><p>如果您渴望挑戰自我，想要加入一個充滿活力和機會的團隊，請將您的履歷寄至 <a href=\"mailto:hr@jenjanlogistics.com\">hr@jenjanlogistics.com</a>，我們期待與您攜手共創物流行業的未來。<br /><br />【JenJan真站電商衛星倉儲物流】期待您的加入！</p>",
  "companyPhoto": [
    "https://picsum.photos/250/150",
    "https://picsum.photos/250/150",
    "https://picsum.photos/250/150",
    "https://picsum.photos/250/150",
    "https://picsum.photos/250/150"
  ],
  "jobTitle": "廚師助手",
  "companyName": "餐飲樂活"
}
```
