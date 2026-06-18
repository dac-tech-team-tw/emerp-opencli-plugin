# emerp opencli plugin

讓 Claude / AI agent 直接操作 EMERP eFormFlow 寫簽呈。

## 安裝

```bash
# 從 GitHub（推薦，需有 repo 讀取權限）
opencli plugin install github:你的組織或帳號/emerp-opencli-plugin

# SSH（若 HTTPS 認證失敗時使用）
opencli plugin install "ssh://git@github.com/你的組織或帳號/emerp-opencli-plugin.git"
```

安裝後確認：
```bash
opencli emerp --help
```

## 使用方式

### 建立一般簽呈草稿

```bash
opencli emerp create-petition "主旨" "說明內容"
```

加費用資訊：
```bash
opencli emerp create-petition "Claude Max 費用申請" \
  "一、申請購買 Claude Max 訂閱。二、金額：20 USD/月。" \
  --amount 640 \
  --payment-method 員工代墊
```

直接送簽（不只存草稿）：
```bash
opencli emerp create-petition "主旨" "說明" --submit
```

### 查詢我的簽呈

```bash
opencli emerp list-petitions
```

只看草稿：
```bash
opencli emerp list-petitions --status 草稿
```

只看待簽：
```bash
opencli emerp list-petitions --status 待簽
```

## 前置條件

- [opencli](https://github.com/jackwener/OpenCLI) 已安裝（`npm install -g @jackwener/opencli`）
- Chrome 瀏覽器已登入 EMERP（`http://10.0.250.60/eFormFlow/`）
- [OpenCLI Chrome 擴充功能](https://chromewebstore.google.com/detail/opencli/ildkmabpimmkaediidaifkhjpohdnifk)已安裝並連線

## 注意事項

- `create-petition` 預設只儲存草稿，需確認後再手動送簽，或加 `--submit` 直接送出
- field UUID 是根據此 EMERP 安裝設定的，若管理員修改表單設計可能需要更新
