1. Source (來源設定)
這裡管理程式碼的來源與觸發部署的規則。

Source Repo (tzustu63/tcu-oga-ai): 這是目前連結的 GitHub 儲存庫。

Root Directory (根目錄): [重要]

用途: 告訴 Railway 你的程式碼放在哪個資料夾。

教學: 既然你的 Watch Path 是 /frontend/**，你的程式碼應該都在 frontend 資料夾內。建議在此處填入 /frontend。這樣 Railway 在執行 build 指令時，就會自動進入該資料夾執行（例如讀取該資料夾下的 package.json）。

Branch (main): 只有推送到 main 分支的程式碼會觸發部署。

Wait for CI:

用途: 如果你有設定 GitHub Actions (例如單元測試)，勾選此項後，Railway 會等到 GitHub Action 跑過且成功後，才開始部署。

建議: 正式環境建議勾選，避免壞掉的程式碼被部署上去。

2. Networking (網路設定)
這裡設定外界如何連線到你的服務。

Public Networking (ogaai.up.railway.app):

用途: 這是對外公開的網址。

設定: 只要保持開啟，使用者就可以透過這個網址看到你的網站。

Port (8080): [非常重要]

用途: 這是 Railway 的 Load Balancer 會去連接你 Container 內部的 Port。

教學: 你的程式碼 (例如 Node.js / Python) 啟動時監聽的 Port 必須與這裡一致。

Railway 會注入一個環境變數 $PORT。最好的寫法是程式碼讀取 process.env.PORT。

如果你程式寫死 3000，這裡就要改成 3000，否則網站會打不開 (Bad Gateway)。

Custom Domain: 如果你有買網域 (例如 www.ogaai.com)，可以在這裡綁定。

Private Networking (frontend.railway.internal):

用途: 這是給 Railway 內部其他 Service 呼叫用的（例如你有另一個 Backend Service 要呼叫這個 Frontend）。

教學: 如果這只是靜態前端給使用者看，通常不需要理會這個設定。

3. Build (建置設定)
這裡設定 Railway 如何打包你的程式碼。

Builder (Railpack Default):

用途: Railway 自動偵測語言並打包的工具 (基於 Nixpacks)。

建議: 保持 Default 即可，它通常能準確偵測是 Node.js、Python 或 Go。

Custom Build Command:

用途: 覆蓋預設的建置指令。

教學: 如果你是 React/Vue 前端，通常需要執行 npm run build。如果 Root Directory 設對了，通常不需要手動填，但如果部署失敗，可以在此明確填入 (如 npm install && npm run build)。

Watch Paths (/frontend/**):

用途: 決定「哪些檔案變更」才需要重新部署。

解釋: 你目前的設定 /frontend/** 意思很好：只有當 frontend 資料夾內的檔案有變動時，才會重新部署。如果你修改了 Repo 根目錄的 README，就不會浪費時間重新部署這個服務。

4. Deploy (部署設定)
這裡設定程式啟動與運作的方式。

Custom Start Command:

用途: 建置完成後，要用什麼指令啟動程式。

教學:

如果是 Node.js 後端：npm start 或 node dist/main.js。

如果是靜態前端 (React/Vue) 透過 Web Server：serve -s build -l $PORT (需安裝 serve 套件)。

Run cd frontend in a pre-deploy step: 如果你沒有設定 Root Directory，這裡可能會建議你這麼做，但建議直接去 Source 區塊設定 Root Directory 比較乾淨。

Regions (Southeast Asia (Singapore)):

建議: 新加坡對台灣連線速度最快，保持這樣即可。

Replicas / Resource Limits:

目前顯示 CPU 32 vCPU / 32 GB RAM 是方案上限，不是你目前用量。通常不需要動，除非流量大到需要開多個副本 (Replicas)。

Healthcheck Path: [建議設定]

用途: Railway 部署後會去 ping 這個路徑，確定有回應才將流量切過來。

教學: 建議填入 / (首頁) 或 /health。如果不設定，有時候程式還在啟動中（但 Port 開了），使用者連進來會看到錯誤畫面。

Restart Policy (On Failure):

用途: 當程式崩潰 (Crash) 時怎麼辦。

建議: 保持 On Failure，它會自動嘗試重啟。

Serverless:

用途: 如果開啟，沒人瀏覽時會自動關閉 (省錢/省額度)，有人連線時才啟動 (會有幾秒延遲)。

建議: 測試階段可以開，正式上線建議關閉以確保速度。

5. Config-as-code
Railway Config File: 這是進階功能，用檔案 (railway.toml) 來管理上述設定，暫時可以忽略。