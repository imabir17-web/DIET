# 我的飲食管家｜GitHub Pages PWA

功能：
- 今日熱量總計
- 蛋白質／碳水化合物／脂肪追蹤
- 每日飲水量與目標進度
- 拍照／上傳食物照片與照片預覽
- 手動新增食物營養資料
- 依今日攝取給予即時飲食建議
- localStorage 儲存，不需資料庫
- PWA，可加入手機主畫面

## 上線
把這個資料夾所有檔案上傳到 GitHub repository，開啟 Settings → Pages → Deploy from branch → main / root。

## AI 食物辨識
目前純靜態 GitHub Pages 版本沒有把 API key 放在前端，因此不會假裝「真的自動辨識」。照片上傳後會預覽，營養素則由使用者確認。若要真正做到「照片 → AI 辨識多項食物 → 份量估算 → 營養素」，建議下一版加入後端 `/api/analyze-food`，由伺服器安全保存 AI API key，再把結構化營養結果回傳給前端。
