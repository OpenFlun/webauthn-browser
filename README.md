# @flun/webauthn-browser <!-- omit in toc -->

![WebAuthn](https://img.shields.io/badge/WebAuthn-Browser_Simplified-blueviolet?style=for-the-badge&logo=WebAuthn)
[![npm (scoped)](https://img.shields.io/npm/v/@flun/webauthn-browser?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@flun/webauthn-browser)

**@flun/webauthn-browser** 是一个专为浏览器环境设计的 WebAuthn（含 Passkeys）前端工具库,基于 [@simplewebauthn/browser](https://simplewebauthn.dev/) 核心逻辑重构并增强,它封装了 `navigator.credentials` API 的复杂细节,提供简洁的 Promise 风格接口,并内置了丰富的错误处理与 Base64URL 编解码工具;

本包以 **ESM** 编写,同时提供 **UMD** 打包产物,可通过 npm 模块方式或 `<script>` 全局方式引入,兼容现代浏览器及部分旧版环境;

## 目录

- [目录](#目录)
- [配置](#配置)
  - [允许安装脚本执行](#允许安装脚本执行)
- [安装](#安装)
  - [NPM 模块方式](#npm-模块方式)
  - [UMD 全局方式](#umd-全局方式)
    - [ES2021（推荐用于现代浏览器）](#es2021推荐用于现代浏览器)
    - [ES5（包含 polyfill，支持 IE11 / 旧版 Edge）](#es5包含-polyfill支持-ie11--旧版-edge)
- [主要功能](#主要功能)
- [快速开始](#快速开始)
  - [模块方式使用示例](#模块方式使用示例)
  - [全局方式使用示例](#全局方式使用示例)
- [API 参考](#api-参考)
  - [核心认证方法](#核心认证方法)
    - [startRegistration(options)](#startregistrationoptions)
    - [startAuthentication(options)](#startauthenticationoptions)
  - [环境检测方法](#环境检测方法)
    - [browserSupportsWebAuthn()](#browsersupportswebauthn)
    - [platformAuthenticatorIsAvailable()](#platformauthenticatorisavailable)
    - [browserSupportsWebAuthnAutofill()](#browsersupportswebauthnautofill)
  - [编解码工具](#编解码工具)
  - [错误类与中止服务](#错误类与中止服务)
    - [WebAuthnError](#webauthnerror)
    - [WebAuthnAbortService](#webauthnabortservice)
  - [内部调试工具](#内部调试工具)
- [错误处理](#错误处理)
- [前后端集成示例](#前后端集成示例)
  - [配合 @flun/webauthn-server](#配合-flunwebauthn-server)
- [许可证](#许可证)
- [相关链接](#相关链接)

---
## 配置

### 允许安装脚本执行

本包在安装时可能触发某些依赖包的自动脚本（如 `postinstall` 等）;如果你的 npm 全局配置或项目配置禁止了脚本执行（例如设置了 `ignore-scripts=true`）,可能会导致安装不完整或运行时异常;

推荐在项目根目录的 `package.json` 中添加 `allowScripts` 字段,显式放行本包及其依赖的脚本:

```json
{
  "allowScripts": {
    "@flun/webauthn-browser": true
    // 如果依赖的其它包（如 bcrypt、electron-winstaller 等）也有脚本,请按需添加,格式相同
  }
}
```

> 如果你信任所有安装包,也可以直接在项目 `.npmrc` 中设置 `allow-scripts = false`（表示关闭脚本拦截,所有脚本均允许执行）,或删除/设为 `ignore-scripts = false`;

---

## 安装

### NPM 模块方式

适用于使用打包工具（Webpack、Vite、Rollup 等）或 Node.js ≥ 22.12.0 的环境;

```sh
npm i @flun/webauthn-browser
```

然后在代码中按需导入：

```js
// ES Module
import { startRegistration, startAuthentication } from '@flun/webauthn-browser';

// CommonJS (Node.js ≥ 22.12.0)
const { startRegistration, startAuthentication } = require('@flun/webauthn-browser');
```

### UMD 全局方式

本包通过 **unpkg** 提供 UMD 版本,引入后所有方法将挂载在全局对象 **`flunWebAuthnBrowser`** 上;

> 注意：ES5 版本包含针对旧版浏览器的 polyfill,会增加体积,但允许在旧环境中使用 `browserSupportsWebAuthn()` 进行特性检测;

#### ES2021（推荐用于现代浏览器）

```html
<script src="https://unpkg.com/@flun/webauthn-browser/dist/index.js"></script>
```

#### ES5（包含 polyfill，支持 IE11 / 旧版 Edge）

```html
<script src="https://unpkg.com/@flun/webauthn-browser/dist/index.es5.js"></script>
```

---

## 主要功能

- ✅ **简化的 WebAuthn 调用**
  `startRegistration()` 和 `startAuthentication()` 自动处理 Base64URL ↔ ArrayBuffer 转换,支持标准 JSON 格式的入参;

- ✅ **内置错误标准化**
  将浏览器原生错误转换为包含 `code` 和 `message` 的 `WebAuthnError` 对象,便于业务层处理;

- ✅ **条件媒介支持（Conditional UI / 自动填充）**
  支持 `useBrowserAutofill` 实现无感登录体验（需页面存在合适的 `<input>` 元素）;

- ✅ **完整的环境检测**
  提供 `browserSupportsWebAuthn()`、`platformAuthenticatorIsAvailable()` 等方法,精确判断设备能力;

- ✅ **编解码工具集**
  导出 `bufferToBase64URLString` / `base64URLStringToBuffer` 等工具函数,方便前后端数据交互;

- ✅ **可中止的认证流程**
  通过 `WebAuthnAbortService` 在必要时取消进行中的认证/注册操作;

---

## 快速开始

以下示例演示了最基本的调用方式,默认与后端使用 JSON 交互;

### 模块方式使用示例

```js
import { startRegistration, startAuthentication } from '@flun/webauthn-browser';

// 注册
async function register(username) {
  const regOptions = await fetch('/api/register/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  }).then(r => r.json());

  const regResponse = await startRegistration({ optionsJSON: regOptions });

  await fetch('/api/register/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, response: regResponse })
  });
}

// 登录
async function login(username) {
  const authOptions = await fetch('/api/login/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  }).then(r => r.json());

  const authResponse = await startAuthentication({ optionsJSON: authOptions }),
    verifyRes = await fetch('/api/login/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, response: authResponse })
    });
  return verifyRes.json();
}
```

### 全局方式使用示例

在 HTML 页面中引入 UMD 脚本后，即可通过全局变量 `flunWebAuthnBrowser` 调用所有方法。

```html
<script src="https://unpkg.com/@flun/webauthn-browser/dist/index.js"></script>
<script>
  (async () => {
    // 1. 首先检测浏览器是否支持 WebAuthn
    if (!flunWebAuthnBrowser.browserSupportsWebAuthn()) {
      return alert('您的浏览器不支持 WebAuthn 或 Passkey，请升级或使用其他方式登录。');
    }

    // ---------- 注册示例 ----------
    async function handleRegister(username) {
      const optionsRes = await fetch('/api/register/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      }), options = await optionsRes.json(),
       response = await flunWebAuthnBrowser.startRegistration({
        optionsJSON: options
      }),
       verifyRes = await fetch('/api/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, response })
      }), result = await verifyRes.json();

      console.log('注册结果:', result);
    }

    // ---------- 登录（认证）示例 ----------
    async function handleLogin(username) {
      const optionsRes = await fetch('/api/login/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      }), options = await optionsRes.json(),
       response = await flunWebAuthnBrowser.startAuthentication({
        optionsJSON: options
      });

      const verifyRes = await fetch('/api/login/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, response })
      });
      const result = await verifyRes.json();
      if (result.verified) {
        console.log('登录成功');
        window.location.href = '/dashboard';
      } else {
        alert('登录失败，请重试');
      }
    }

    // ---------- 带自动填充（Conditional UI）的登录示例 ----------
    // 注意：使用自动填充时，页面必须包含类似如下的 input 元素：
    // <input type="text" name="username" autocomplete="username webauthn" />
    async function handleAutofillLogin() {
      if (!(await flunWebAuthnBrowser.browserSupportsWebAuthnAutofill())) {
        return console.warn('当前浏览器不支持 WebAuthn 自动填充');
      }

      const optionsRes = await fetch('/api/login/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useAutofill: true })
      }), options = await optionsRes.json();

      try {
        const response = await flunWebAuthnBrowser.startAuthentication({
          optionsJSON: options,
          useBrowserAutofill: true
        }),
         verifyRes = await fetch('/api/login/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response })
        }), result = await verifyRes.json();

        if (result.verified) {
          console.log('自动填充登录成功');
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.warn('自动填充登录未完成:', error.message);
      }
    }

    // 绑定按钮事件示例
    document.getElementById('register-btn')?.addEventListener('click', () => {
      const username = document.getElementById('username-input').value;
      handleRegister(username);
    });

    document.getElementById('login-btn')?.addEventListener('click', () => {
      const username = document.getElementById('username-input').value;
      handleLogin(username);
    });

    // 自动填充登录通常在页面加载时触发
    window.addEventListener('load', () => {
      handleAutofillLogin();
    });
  })();
</script>
```

---

## API 参考

### 核心认证方法

#### startRegistration(options)

发起 WebAuthn 注册流程，创建新凭证。

**参数**

| 字段名            | 类型      | 默认值  | 描述                                                            |
| ----------------- | --------- | ------- | --------------------------------------------------------------- |
| `optionsJSON`     | `object`  | 必填    | 由服务端调用 `generateRegistrationOptions()` 生成的 JSON 对象   |
| `useAutoRegister` | `boolean` | `false` | 是否启用条件媒介自动注册（实验性，需浏览器支持 Conditional UI） |

**返回值** `Promise<RegistrationResponseJSON>`

返回一个经过标准化处理的 JSON 对象，可直接发送给后端 `verifyRegistrationResponse()` 验证。响应格式如下：

```ts
interface RegistrationResponseJSON {
  id: string;
  rawId: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
    transports?: AuthenticatorTransport[];
    publicKeyAlgorithm?: number;
    publicKey?: string;
    authenticatorData?: string;
  };
  type: string;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  authenticatorAttachment?: string;
}
```

**示例**

```js
const response = await startRegistration({ optionsJSON });
// 发送 response 至服务端
```

#### startAuthentication(options)

发起 WebAuthn 认证（登录）流程。

**参数**

| 字段名                       | 类型      | 默认值  | 描述                                                                           |
| ---------------------------- | --------- | ------- | ------------------------------------------------------------------------------ |
| `optionsJSON`                | `object`  | 必填    | 由服务端调用 `generateAuthenticationOptions()` 生成的 JSON 对象                |
| `useBrowserAutofill`         | `boolean` | `false` | 是否启用条件媒介（自动填充），实现无感登录                                     |
| `verifyBrowserAutofillInput` | `boolean` | `true`  | 启用自动填充时是否检查页面是否存在 `autocomplete="... webauthn"` 的 input 元素 |

**返回值** `Promise<AuthenticationResponseJSON>`

```ts
interface AuthenticationResponseJSON {
  id: string;
  rawId: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string;
  };
  type: string;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  authenticatorAttachment?: string;
}
```

**示例**

```js
// 普通登录
const response = await startAuthentication({ optionsJSON });

// 自动填充登录（需页面存在 <input autocomplete="webauthn">）
const response = await startAuthentication({
  optionsJSON,
  useBrowserAutofill: true
});
```

### 环境检测方法

#### browserSupportsWebAuthn()

检查当前浏览器是否支持 WebAuthn API。

**返回值** `boolean`

```js
if (flunWebAuthnBrowser.browserSupportsWebAuthn()) {
  // 可以使用 WebAuthn
}
```

#### platformAuthenticatorIsAvailable()

检查平台认证器（如 Touch ID、Face ID、Windows Hello）是否可用。

**返回值** `Promise<boolean>`

```js
const available = await flunWebAuthnBrowser.platformAuthenticatorIsAvailable();
```

#### browserSupportsWebAuthnAutofill()

检查当前浏览器是否支持 WebAuthn 条件媒介（自动填充）。

**返回值** `Promise<boolean>`

```js
if (await flunWebAuthnBrowser.browserSupportsWebAuthnAutofill()) {
  // 可以使用 useBrowserAutofill 选项
}
```

### 编解码工具

这些工具函数直接挂载在导出对象上,便于前后端统一数据格式;

| 函数                                           | 描述                                   |
| ---------------------------------------------- | -------------------------------------- |
| `bufferToBase64URLString(buffer: ArrayBuffer)` | 将 ArrayBuffer 转换为 Base64URL 字符串 |
| `base64URLStringToBuffer(base64url: string)`   | 将 Base64URL 字符串转换为 ArrayBuffer  |

**示例**

```js
const { bufferToBase64URLString, base64URLStringToBuffer } = flunWebAuthnBrowser,
 challengeBuffer = base64URLStringToBuffer(optionsJSON.challenge),
 encoded = bufferToBase64URLString(challengeBuffer);
```

### 错误类与中止服务

#### WebAuthnError

自定义错误类，继承自 `Error`。当认证/注册过程中发生可识别的错误时抛出。

**属性**

| 属性    | 类型     | 描述                         |
| ------- | -------- | ---------------------------- |
| `name`  | `string` | 错误名称（通常为原始错误名） |
| `code`  | `string` | 标准化的错误码（见下方表格） |
| `cause` | `Error`  | 浏览器抛出的原始错误对象     |

**常见错误码**

| 错误码                                                        | 描述                                             |
| ------------------------------------------------------------- | ------------------------------------------------ |
| `ERROR_CEREMONY_ABORTED`                                      | 认证/注册流程被中止（如调用 `cancelCeremony()`） |
| `ERROR_INVALID_DOMAIN`                                        | 当前域名无效                                     |
| `ERROR_INVALID_RP_ID`                                         | RP ID 与当前域名不匹配                           |
| `ERROR_AUTHENTICATOR_GENERAL_ERROR`                           | 认证器通用错误                                   |
| `ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED`                   | 认证器已被注册（注册时）                         |
| `ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT` | 需要可发现凭证但认证器不支持                     |
| `ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY`                        | 透传错误，需查看 `cause` 属性                    |

#### WebAuthnAbortService

用于手动取消正在进行的 WebAuthn 操作。

**方法**

| 方法                     | 描述                                       |
| ------------------------ | ------------------------------------------ |
| `createNewAbortSignal()` | 创建新的 AbortSignal，并自动中止之前的操作 |
| `cancelCeremony()`       | 主动取消当前正在进行的认证/注册流程        |

```js
// 取消当前所有 WebAuthn 操作
flunWebAuthnBrowser.WebAuthnAbortService.cancelCeremony();
```

### 内部调试工具

以下属性暴露了部分内部实现细节，**仅用于高级调试或扩展，不推荐在生产中直接使用**。

| 属性                                        | 描述                   |
| ------------------------------------------- | ---------------------- |
| `_browserSupportsWebAuthnInternals`         | 内部检测函数的桩对象   |
| `_browserSupportsWebAuthnAutofillInternals` | 自动填充检测的内部实现 |

---

## 错误处理

推荐使用 `try...catch` 捕获 `WebAuthnError` 并根据 `code` 进行差异化处理。

```js
import { startAuthentication, WebAuthnError } from '@flun/webauthn-browser';

try {
  const response = await startAuthentication({ optionsJSON });
  // 发送 response
} catch (err) {
  if (err instanceof WebAuthnError) {
    switch (err.code) {
      case 'ERROR_CEREMONY_ABORTED':
        console.log('用户取消了操作');
        break;
      case 'ERROR_INVALID_RP_ID':
        alert('配置错误：RP ID 无效');
        break;
      default:
        console.error('认证失败', err.message);
    }
  } else {
    // 处理其他非 WebAuthn 错误
  }
}
```

---

## 前后端集成示例

### 配合 @flun/webauthn-server

以下是一个完整的最小化集成示例，前端使用本库，后端使用 [`@flun/webauthn-server`](https://www.npmjs.com/package/@flun/webauthn-server)。

**前端代码**

```js
import {  startRegistration,  startAuthentication,  browserSupportsWebAuthn} from '@flun/webauthn-browser';

async function register(username) {
  // 1. 请求注册选项
  const optionsRes = await fetch('/api/register/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  }), options = await optionsRes.json(),
   // 2. 启动浏览器注册流程
   response = await startRegistration({ optionsJSON: options }),
   // 3. 将响应发送给服务端验证
   verifyRes = await fetch('/api/register/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, response })
  });
  return verifyRes.json();
}

async function login(username) {
  // 1. 请求认证选项
  const optionsRes = await fetch('/api/login/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  }), options = await optionsRes.json(),
   // 2. 启动浏览器认证流程（可开启自动填充）
   response = await startAuthentication({ optionsJSON: options }),
   // 3. 发送响应验证
   verifyRes = await fetch('/api/login/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, response })
  });
  return verifyRes.json();
}
```

**后端代码片段**（基于 Express + `@flun/webauthn-server`）

```js
import {
  generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse
} from '@flun/webauthn-server';

app.post('/api/register/begin', async (req, res) => {
  const { username } = req.body, user = getUser(username),
   options = await generateRegistrationOptions({
    rpName: 'My App',
    rpID: 'localhost',
    userName: username,
    userID: user.id,
  });
  storeChallenge(username, options.challenge);
  res.json(options);
});

app.post('/api/register/complete', async (req, res) => {
  const { username, response } = req.body, expectedChallenge = getChallenge(username),
   verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: 'http://localhost:7296',
    expectedRPID: 'localhost',
  });
  if (verification.verified) {
    saveCredential(username, verification.registrationInfo);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Verification failed' });
  }
});

// 认证接口类似...
```

---

## 许可证

ISC © [flun](https://github.com/OpenFlun)

---

## 相关链接

- [GitHub 仓库](https://github.com/OpenFlun/webauthn-browser)
- [npm 包页面](https://www.npmjs.com/package/@flun/webauthn-browser)
- [配套后端库 @flun/webauthn-server](https://www.npmjs.com/package/@flun/webauthn-server)
- [W3C WebAuthn 规范](https://w3c.github.io/webauthn/)