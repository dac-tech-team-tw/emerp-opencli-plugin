# 快速上手：用 Claude 幫你寫簽呈

---

## 第一次使用前：安裝（只需做一次）

### 步驟一：一鍵安裝

開啟 **PowerShell**，貼上執行：

```powershell
irm https://raw.githubusercontent.com/dac-tech-team-tw/emerp-opencli-plugin/main/install.ps1 | iex
```

這會自動幫你安裝 Node.js、OpenCLI、EMERP plugin，以及 Claude Code 的 skill。

---

### 步驟二：安裝 Chrome 擴充功能

前往 Chrome 線上應用程式商店，安裝 **OpenCLI**：

👉 https://chromewebstore.google.com/detail/opencli/ildkmabpimmkaediidaifkhjpohdnifk

安裝完成後，Chrome 右上角會出現 OpenCLI 圖示。

---

### 步驟三：登入 EMERP（每次使用前都要確認）

1. 開啟 Chrome，前往 **http://10.0.250.60/eFormFlow/**
2. 用公司帳號登入
3. 確認右上角 OpenCLI 圖示顯示 **「已連線」**

> ⚠️ 沒有登入、或 OpenCLI 沒有顯示已連線，指令會失敗。
> EMERP 僅限公司內部網路或 VPN，在外需先連線 VPN。

---

## 每次使用：直接跟 Claude 說

安裝完成後，打開 Claude Code（或 IDE 裡的 Claude），**直接用中文說你要做什麼**。

---

### 常見情境

**申請費用、需要審核**

> 幫我寫一份簽呈，申請購買 Claude Max 訂閱，金額 640 元，由我先代墊。

**不確定要填什麼**

> 我要申請一個外部服務的費用，幫我寫簽呈。

Claude 會主動問你缺少的資訊（金額、說明、支付方式）再送出。

**想先確認內容再送出**

> 幫我草擬一份簽呈，申請出差費用 1500 元，我先看過再決定要不要送。

Claude 預設只存草稿，你確認後再說「送出」才會正式送簽。

**查自己的簽呈狀態**

> 我有哪些待審核的簽呈？

> 幫我查最近的草稿。

---

### 提問技巧

| 想要的結果 | 怎麼說 |
|-----------|--------|
| 存成草稿，自己去 EMERP 確認後再送 | 「先存草稿」或什麼都不說（預設行為） |
| 直接送出不需二次確認 | 「直接送簽」或「立刻送出」 |
| 查詢特定狀態的簽呈 | 「查待簽的簽呈」、「有哪些已核准？」 |

---

## 流程圖

```
你說：「幫我申請 XXX 費用」
         ↓
Claude 確認主旨、金額、說明內容
         ↓
你說：「OK 就這樣」
         ↓
Claude 在 EMERP 建立草稿 → 回傳簽呈編號
         ↓
你說：「送出」
         ↓
Claude 送簽 → 回傳「已送簽」
         ↓
主管在 EMERP 收到通知，開始審核
```

---

## 常見問題

**Q：執行時出現錯誤，說找不到瀏覽器？**
A：確認 Chrome 有開著，且右上角 OpenCLI 圖示顯示已連線。

**Q：出現登入錯誤（auth error）？**
A：在 Chrome 手動開啟 http://10.0.250.60/eFormFlow/ 重新登入，再試一次。

**Q：在家裡可以用嗎？**
A：需要先連上公司 VPN，再確認 Chrome 已登入 EMERP。

**Q：簽呈送出後可以撤回嗎？**
A：無法透過 Claude 撤回，需要自己到 EMERP 網頁手動操作。

**Q：Claude 不懂我在說簽呈，怎麼辦？**
A：確認 skill 有安裝成功（安裝腳本步驟四），或重新執行安裝腳本。
