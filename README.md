# EMERP 簽呈自動化 — OpenCLI Plugin

讓 Claude / AI agent 直接幫你在 EMERP eFormFlow 寫簽呈、查簽呈。

---

## 快速安裝（Windows，一行搞定）

開啟 **PowerShell**，貼上執行：

```powershell
irm https://raw.githubusercontent.com/dac-tech-team-tw/emerp-opencli-plugin/main/install.ps1 | iex
```

會自動完成 Node.js、OpenCLI、Plugin 的安裝與驗證。

> 安裝完畢後，仍需手動完成 **第三步（Chrome 擴充功能）**。

---

## 手動安裝步驟

---

## 第一步：安裝 Node.js

opencli 需要 Node.js 執行環境。

前往 https://nodejs.org/ 下載並安裝 **LTS 版本**（建議 v21 以上）。

安裝後開啟終端機（Terminal / PowerShell），確認：

```bash
node -v
```

有版本號出現就 OK。

---

## 第二步：安裝 OpenCLI

```bash
npm install -g @jackwener/opencli
```

確認安裝成功：

```bash
opencli --version
```

---

## 第三步：安裝 OpenCLI Chrome 擴充功能

前往 Chrome 線上應用程式商店，安裝 **OpenCLI** 擴充功能：

https://chromewebstore.google.com/detail/opencli/ildkmabpimmkaediidaifkhjpohdnifk

安裝後，Chrome 右上角會出現 OpenCLI 圖示。

> **重要：** 使用前請確認 Chrome 已登入 EMERP（http://10.0.250.60/eFormFlow/），且 OpenCLI 擴充功能顯示「已連線」。

---

## 第四步：安裝這個 Plugin

開啟終端機，執行：

```bash
opencli plugin install github:dac-tech-team-tw/emerp-opencli-plugin
```

安裝成功後確認：

```bash
opencli emerp --help
```

看到指令清單就完成了。

---

## 使用方式

### 建立一般簽呈（草稿）

```bash
opencli emerp create-petition "主旨" "說明內容"
```

範例：

```bash
opencli emerp create-petition "Claude Max 訂閱費用申請" \
  "一、申請購買 Claude Max 訂閱以支援 AI 開發工作。二、金額：20 USD/月（約 640 元）。三、支付對象：Anthropic。" \
  --amount 640 \
  --payment-method 員工代墊
```

建立後直接送簽（不只存草稿）：

```bash
opencli emerp create-petition "主旨" "說明" --submit
```

**支付方式選項：**

| 值 | 說明 |
|----|------|
| `員工代墊` | 由員工先自行付款，事後請款 |
| `暫借` | 向公司借款支付 |
| `月結30天` | 廠商月結付款 |
| `其他` | 其他方式，請在「支付方式說明」補充 |

不填 `--payment-method` 表示無需費用。

---

### 查詢我的簽呈

```bash
opencli emerp list-petitions
```

依狀態篩選：

```bash
opencli emerp list-petitions --status 草稿
opencli emerp list-petitions --status 待簽
opencli emerp list-petitions --status 已核准
opencli emerp list-petitions --status 已駁回
opencli emerp list-petitions --status 已撤簽
```

---

## 常見問題

**Q：執行時出現「browser not connected」？**
A：確認 Chrome 有開啟、有安裝 OpenCLI 擴充功能，且擴充功能圖示顯示已連線。

**Q：出現 auth 錯誤？**
A：在 Chrome 先手動登入 EMERP（http://10.0.250.60/eFormFlow/），再重新執行。

**Q：在辦公室以外的地方能用嗎？**
A：EMERP 系統限定公司內部網路，必須在辦公室或連 VPN。
