# my-scroll-app

### Vue + Typescript + VueUse + SASS + Tailwindcss

## 關於
測試利用 Virtual list 渲染大量列表時的效果。

本專案使用 [Faker](https://fakerjs.dev/) 製作模擬資料。並利用 VueUse 中的 [useVirtualList](https://vueuse.org/core/useVirtualList/) 處理 Virtual list 的渲染。

## 功能

`插入`： 元素插入測試。元素時間為目前範圍的亂序。插入列表後進行排序。

`載入更多`： 元素載入測試。時間早於目前範圍。插入列表後進行排序。

`刷新項目`： 隨機更新元素時間。修改列表後進行排序。

`排序`： 觸發列表排序。預設利用 [Web Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Worker) 處理排序。

`分批處理`： 利用 [Scheduler API](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield) 分批處理「插入」、「載入更多」、「刷新項目」動作。若不支援時，改為 `setTimeout` 0ms 代替。

## 觀察

不同 CPU throttle：
  
  1. 正常 - 本地排序時間 50ms 時為元素 40000 左右。
  2. 降低 6 倍 - 本地排序時間 50ms 時為元素 11000 左右。
  3. 降低 20 倍 - 本地排序時間 50ms 時為元素 3500 左右。