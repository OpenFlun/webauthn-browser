import { startAuthentication } from './startAuthentication.js';
import { startRegistration } from './startRegistration.js';

// =================================== startAuthentication.js ===================================
/**
 * ```js
 * // 文件导出内容
 * startAuthentication(); // 通过 WebAuthn 断言开始身份验证器"登录"
 * ```
 * >查看定义:@see {@link startAuthentication}
 */
declare module './startAuthentication.js' {
    export * from './startAuthentication.js';
}

// =================================== startRegistration.js ===================================
/**
 * ```js
 * // 文件导出内容
 * startRegistration(); // 通过 WebAuthn 证明开始认证器"注册"
 * ```
 * >查看定义:@see {@link startRegistration}
 */
declare module './startRegistration.js' {
    export * from './startRegistration.js';
}

// ================================ 导出入口 ================================
/**
 * 模块导出内容:
 * ```js
 * startAuthentication(); // 通过 WebAuthn 断言开始身份验证器"登录"
 * startRegistration();   // 通过 WebAuthn 证明开始认证器"注册"
 * ```
 * >查看定义:@see {@link startAuthentication}、{@link startRegistration}
 */
declare module './index.js' {
    export * from './startAuthentication.js';
    export * from './startRegistration.js';
}