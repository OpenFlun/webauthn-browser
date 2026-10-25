import { isValidDomain } from './isValidDomain.js';
import { WebAuthnError } from './webAuthnError.js';

/**
 * 尝试推断调用 `navigator.credentials.create()` 后引发错误的原因
 * - 查看定义: @see {@link identifyRegistrationError}
 *
 * @param {Object} params - 参数对象
 * @param {Error} params.error - 原始错误对象
 * @param {CredentialCreationOptions} params.options - 传递给 `navigator.credentials.create()` 的选项
 * @returns {WebAuthnError|Error} 如果错误能被识别则返回包含更详细信息的 WebAuthnError,否则返回原始错误
 */
const identifyRegistrationError = ({ error, options }) => {
    const { publicKey } = options;
    if (!publicKey) throw Error('options 参数缺少必需的 publicKey 属性');

    if (error.name === 'AbortError') {
        if (options.signal instanceof AbortSignal)
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (第 16 步)
            return new WebAuthnError({
                message: '注册仪式收到了中止信号', code: 'ERROR_CEREMONY_ABORTED', cause: error,
            });
    }
    else if (error.name === 'ConstraintError') {
        if (publicKey.authenticatorSelection?.requireResidentKey === true)
            // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (第 4 步)
            return new WebAuthnError({
                message: '需要可发现凭证,但没有可用的身份验证器支持该功能',
                code: 'ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT', cause: error,
            });
        // `mediation` 在 CredentialCreationOptions 中尚不存在,但截至 2024 年 9 月已有可能
        else if (options.mediation === 'conditional' && publicKey.authenticatorSelection?.userVerification === 'required')
            // https://w3c.github.io/webauthn/#sctn-createCredential (第 22.4 步)
            return new WebAuthnError({
                message: '自动注册期间要求用户验证,但无法执行',
                code: 'ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE', cause: error
            });

        else if (publicKey.authenticatorSelection?.userVerification === 'required')
            // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (第 5 步)
            return new WebAuthnError({
                message: '需要用户验证,但没有可用的身份验证器支持该功能',
                code: 'ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT', cause: error
            });
    }
    else if (error.name === 'InvalidStateError')
        // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (第 20 步)
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (第 3 步)
        return new WebAuthnError({
            message: '该身份验证器此前已注册', code: 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED', cause: error
        });
    else if (error.name === 'NotAllowedError')
        /**
         * 直接传递错误;平台对该错误的定义超出了规范范围,保留原始错误消息;
         */
        return new WebAuthnError({ message: error.message, code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY', cause: error });
    else if (error.name === 'NotSupportedError') {
        const validPubKeyCredParams = publicKey.pubKeyCredParams.filter(param => param.type === 'public-key');
        if (validPubKeyCredParams.length === 0)
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (第 10 步)
            return new WebAuthnError({
                message: 'pubKeyCredParams 中没有类型为 "public-key" 的条目',
                code: 'ERROR_MALFORMED_PUBKEYCREDPARAMS', cause: error
            });
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (第 2 步)
        return new WebAuthnError({
            message: '身份验证器不支持指定的任何 pubKeyCredParams 算法',
            code: 'ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG', cause: error,
        });
    }
    else if (error.name === 'SecurityError') {
        const effectiveDomain = globalThis.location.hostname;
        if (!isValidDomain(effectiveDomain))
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (第 7 步)
            return new WebAuthnError({
                message: `${globalThis.location.hostname} 是一个无效的域名`, code: 'ERROR_INVALID_DOMAIN', cause: error
            });
        else if (publicKey.rp.id !== effectiveDomain)
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (第 8 步)
            return new WebAuthnError({
                message: `信赖方 ID"${publicKey.rp.id}"对此域名无效`, code: 'ERROR_INVALID_RP_ID', cause: error
            });
    }
    else if (error.name === 'TypeError') {
        if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64)
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (第 5 步)
            return new WebAuthnError({
                message: '用户 ID 长度不在 1~64 字节之间', code: 'ERROR_INVALID_USER_ID_LENGTH', cause: error
            });
    }
    else if (error.name === 'UnknownError')
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (第 1 步)
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (第 8 步)
        return new WebAuthnError({
            message: '身份验证器无法处理指定的选项,或无法创建新的凭证',
            code: 'ERROR_AUTHENTICATOR_GENERAL_ERROR', cause: error
        });

    return error;
}

export { identifyRegistrationError };