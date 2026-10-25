import {
    bufferToBase64URLString, base64URLStringToBuffer, _browserSupportsWebAuthnInternals, browserSupportsWebAuthn,
    _browserSupportsWebAuthnAutofillInternals, browserSupportsWebAuthnAutofill, platformAuthenticatorIsAvailable,
    WebAuthnAbortService, WebAuthnError
} from './helpers/index.js';
import { startAuthentication, startRegistration } from './methods/index.js';

/**
 * 模块导出内容:
 * ```js
 * // 登录和注册处理函数
 * startAuthentication(); // 通过 WebAuthn 断言开始身份验证器"登录"
 * startRegistration();   // 通过 WebAuthn 证明开始认证器"注册"
 *
 * // 工具
 * const _browserSupportsWebAuthnInternals={};         // 测试期间对返回值进行桩(stub)处理
 * const _browserSupportsWebAuthnAutofillInternals={}; // 测试期间模拟返回值;
 * const WebAuthnAbortService = new BaseWebAuthnAbortService();
 * // 服务单例,用于确保同一时间只有一个 WebAuthn 仪式处于活动状态;
 *
 * base64URLStringToBuffer();                          // 将 Base64URL 编码的字符串转换为 Array Buffer;
 * bufferToBase64URLString();                          // 将给定的数组缓冲区转换为 Base64URL 编码的字符串;
 * browserSupportsWebAuthn();                          // 判断当前浏览器是否支持 WebAuthn
 * browserSupportsWebAuthnAutofill();                  // 判断浏览器是否支持条件式UI;
 * platformAuthenticatorIsAvailable();                 // 判断浏览器是否能够与内置身份验证器通信;
 *
 * class WebAuthnError{};                              // 自定义错误,用于更细致地说明规范中八种错误被抛出的原因;
 * ```
 * >查看定义:@see
 *- 登录和注册处理: {@link startAuthentication}、{@link startRegistration}
 *- 工具: {@link _browserSupportsWebAuthnInternals}、{@link _browserSupportsWebAuthnAutofillInternals}、
 * {@link WebAuthnAbortService}、
 * {@link base64URLStringToBuffer}、{@link bufferToBase64URLString}、 {@link browserSupportsWebAuthn}、
 * {@link browserSupportsWebAuthnAutofill}、{@link platformAuthenticatorIsAvailable}
 * >{@link WebAuthnError}
 */
declare module './index.js' {
    export {
        bufferToBase64URLString, base64URLStringToBuffer, _browserSupportsWebAuthnInternals, browserSupportsWebAuthn,
        _browserSupportsWebAuthnAutofillInternals, browserSupportsWebAuthnAutofill, platformAuthenticatorIsAvailable,
        WebAuthnAbortService, WebAuthnError
    } from './helpers/index.js';
    export * from './methods/index.js';
}