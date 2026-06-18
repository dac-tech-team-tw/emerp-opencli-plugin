---
name: emerp-petition
description: >
  Use this skill whenever the user wants to write, create, submit, or check 簽呈 (petitions / approval requests) in the company EMERP system. Triggers on: "寫簽呈", "申請費用", "送簽", "查簽呈", "費用申請", "expense approval", "petition", or any mention of getting company approval for a purchase. Always use this skill proactively when the user's intent involves EMERP — don't wait for them to mention "opencli".
---

# EMERP 簽呈自動化

使用 `opencli emerp` 指令操作 EMERP eFormFlow。執行前需確認 Chrome 已登入 EMERP 且 OpenCLI 擴充功能已連線。

## 指令總覽

### 建立簽呈

```bash
opencli emerp create-petition "<主旨>" "<說明>" [選項]
```

| 選項 | 說明 |
|------|------|
| `--amount <整數>` | 預估金額（元），無費用可不填 |
| `--payment-method <方式>` | `員工代墊` / `暫借` / `月結30天` / `其他` |
| `--payment-note <文字>` | 支付方式補充說明（選填） |
| `--submit` | 直接送簽，不加此 flag 只儲存草稿 |

回傳欄位：`formId`、`subject`、`status`（草稿已儲存 / 已送簽）、`url`

### 查詢簽呈

```bash
opencli emerp list-petitions [--status <狀態>] [--limit <筆數>]
```

`--status` 選項：`草稿` / `待簽` / `已核准` / `已駁回` / `已撤簽`

---

## 操作原則

1. **先草擬、再確認**：幫用戶起草主旨與說明後，請用戶確認內容再執行
2. **預設存草稿**：除非用戶明確說「送出」或「送簽」，否則不加 `--submit`
3. **說明欄格式**：一、事由 二、金額與幣別 三、支付對象 四、補充說明
4. **送簽後提醒**：執行成功後告知用戶可到 EMERP 網頁確認簽核狀態

---

## 技術背景

此 plugin 使用 **Strategy.PAGE_FETCH**，透過 opencli 附加在已登入的 Chrome 瀏覽器上，以 `fetch()` 呼叫 EMERP 的內部 API，複用瀏覽器的 session cookie，不需要單獨管理帳密。

| 動作 | API endpoint |
|------|-------------|
| 讀取表單預設值（申請人、部門） | `POST /Wfem2030/GetForm` |
| 儲存草稿 | `POST /Wfem2030/SaveForm` |
| 儲存並送簽 | `POST /Wfem2030/SaveAndSendForm` |
| 查詢我的簽呈 | `POST /Wfem2030/QueryGetDatas` |

表單 template UUID（一般簽呈）：`b79bcf9f-79a2-41dd-83f1-d97e7354a067`

欄位 UUID 對應（表單設計決定，管理員改版才會異動）：
- 主旨 `417b0770`、說明 `976ceb23`、申請人 `25815493`、部門 `6d9e435a`
- 金額 `7d3e9679`、支付方式 `e0d579aa`、支付補充 `823cb7f2`

### 已知限制

- EMERP 僅限公司內部網路（辦公室或 VPN），無法在外部使用
- 每次執行需要 Chrome 開著且 OpenCLI 擴充功能顯示「已連線」
- `--submit` 直接進入簽核流程，送出後無法在此 plugin 內撤回；需到 EMERP 網頁手動操作

---

## 範例

```bash
# 建立草稿（預設）
opencli emerp create-petition \
  "Claude Max 訂閱費用申請" \
  "一、申請購買 Claude Max 訂閱以支援 AI 開發工作。二、金額：20 USD/月（約 640 元）。三、支付對象：Anthropic。" \
  --amount 640 \
  --payment-method 員工代墊

# 確認草稿後直接送簽
opencli emerp create-petition \
  "差旅費用申請" \
  "一、2026/06/20 出差台北。二、金額：1500 元。三、支付對象：交通局。" \
  --amount 1500 \
  --payment-method 員工代墊 \
  --submit

# 查看草稿清單
opencli emerp list-petitions --status 草稿

# 查看待簽清單（確認送出成功）
opencli emerp list-petitions --status 待簽
```
