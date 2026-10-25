import { isValidDomain } from './isValidDomain.js';
import { WebAuthnError } from './webAuthnError.js';

/**
 * 尝试推断调用 `navigator.credentials.get()` 后引发错误的原因;
 * - 查看定义:@see {@link identifyAuthenticationError}
 *
 * @param {Object} params - 参数对象
 * @param {Error|DOMException} params.error - 原始错误对象
 * @param {CredentialRequestOptions} params.options - navigator.credentials.get() 传入的选项
 * @returns {Error|WebAuthnError} 解析后的错误对象(WebAuthnError 或原始错误)
 */
const identifyAuthenticationError = ({ error, options }) => {
    const { publicKey } = options;
    if (!publicKey) throw Error('options 参数缺少必需的 publicKey 属性');

    if (error.name === 'AbortError') {
        if (options.signal instanceof AbortSignal)
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (第 16 步)
            return new WebAuthnError({ message: '身份验证收到了中止信号', code: 'ERROR_CEREMONY_ABORTED', cause: error });
    }
    else if (error.name === 'NotAllowedError')
        /**
         * 直接传递错误,平台对该错误的定义超出了规范范围,我们不想覆盖可能更有用的错误消息;
         */
        return new WebAuthnError({ message: error.message, code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY', cause: error });
    else if (error.name === 'SecurityError') {
        const effectiveDomain = globalThis.location.hostname;
        if (!isValidDomain(effectiveDomain))
            // https://www.w3.org/TR/webauthn-2/#sctn-discover-from-external-source (第 5 步)
            return new WebAuthnError({
                message: `${globalThis.location.hostname} 是一个无效的域名`, code: 'ERROR_INVALID_DOMAIN', cause: error
            });
        else if (publicKey.rpId !== effectiveDomain)
            // https://www.w3.org/TR/webauthn-2/#sctn-discover-from-external-source (第 6 步)
            return new WebAuthnError({
                message: `信赖方 ID"${publicKey.rpId}"对此域名无效`, code: 'ERROR_INVALID_RP_ID', cause: error
            });
    }
    else if (error.name === 'UnknownError')
        // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (第 1 步)
        // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (第 12 步)
        return new WebAuthnError({
            message: '身份验证器无法处理指定的选项或创建新的断言签名',
            code: 'ERROR_AUTHENTICATOR_GENERAL_ERROR', cause: error
        });

    return error;
}

export { identifyAuthenticationError };