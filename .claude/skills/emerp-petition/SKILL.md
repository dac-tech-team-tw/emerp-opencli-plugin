---
name: emerp-petition
description: >
  Use this skill whenever the user wants to write, create, submit, or check 簽呈 (petitions / approval requests) in the company EMERP system. Triggers on: "寫簽呈", "申請費用", "送簽", "查簽呈", "費用申請", "expense approval", "petition", or any mention of getting company approval for a purchase. Always use this skill proactively when the user's intent involves EMERP — don't wait for them to mention "opencli".
---

# EMERP 簽呈自動化

使用 `opencli emerp` 指令操作 EMERP eFormFlow。執行前需確認 Chrome 已登入 EMERP 且 OpenCLI 擴充功能已連線。

## 建立簽呈草稿

```bash
opencli emerp create-petition "<主旨>" "<說明>" [--amount <金額>] [--payment-method <方式>] [--payment-note <補充說明>]
```

- `--amount`：預估金額（整數，元），無費用可不填
- `--payment-method`：支付方式，選項：`員工代墊` / `暫借` / `月結30天` / `其他`
- `--payment-note`：支付方式補充說明（選填）
- `--submit`：直接送簽（預設只存草稿）

## 查詢我的簽呈

```bash
opencli emerp list-petitions [--status <狀態>] [--limit <筆數>]
```

- `--status` 選項：`草稿` / `待簽` / `已核准` / `已駁回` / `已撤簽`

## 操作原則

1. 先幫用戶草擬主旨與說明內容，確認後再執行
2. 預設只存草稿（不加 `--submit`），讓用戶在 EMERP 網頁確認後再送簽
3. 只有用戶明確說「送出」或「送簽」時，才加 `--submit`
4. 說明欄建議格式：一、事由 二、金額 三、支付對象 四、其他補充

## 範例

```bash
# 建立草稿
opencli emerp create-petition \
  "Claude Max 訂閱費用申請" \
  "一、申請購買 Claude Max 訂閱以支援 AI 開發工作。二、金額：20 USD/月（約 640 元）。三、支付對象：Anthropic。" \
  --amount 640 \
  --payment-method 員工代墊

# 查看草稿
opencli emerp list-petitions --status 草稿
```
