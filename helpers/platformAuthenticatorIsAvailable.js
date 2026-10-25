import { browserSupportsWebAuthn } from './browserSupportsWebAuthn.js';

/**
 * 判断浏览器是否能够与内置身份验证器(如 Touch ID、Android 指纹扫描器或 Windows Hello)通信;
 * 该方法无法告知平台身份验证器的具体名称;
 * - 查看定义:@see {@link platformAuthenticatorIsAvailable}
 * @returns {Promise<boolean>} 如果平台身份验证器可用,则解析为 true,否则为 false;
 */
const platformAuthenticatorIsAvailable = () => {
    if (!browserSupportsWebAuthn()) return new Promise(resolve => resolve(false));
    return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

export { platformAuthenticatorIsAvailable };