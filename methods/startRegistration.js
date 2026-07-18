import {
    bufferToBase64URLString, base64URLStringToBuffer, browserSupportsWebAuthn, isWindows, extractBase64Id, normalizeOptions,
    identifyRegistrationError, toAuthenticatorAttachment, toPublicKeyCredentialDescriptor, WebAuthnAbortService
} from '../helpers/index.js';

/**
 * 当检测到通行密钥提供方拦截 WebAuthn API 调用导致的问题时,发出可见警告
 *
 * @param {string} methodName - 被错误实现的 WebAuthn API 方法名称
 * @param {unknown} cause - 捕获到的原始错误对象
 * @returns {void}
 */
const warnOnBrokenImplementation = (methodName, cause) => {
    console.warn(`拦截此 WebAuthn API 调用的浏览器扩展错误地实现了 ${methodName};请向该扩展的开发者报告此问题;\n`, cause);
};

/**
 * 通过 WebAuthn 证明开始认证器“注册”
 * - 查看定义:@see {@link startRegistration}
 *
 * @param {Object} options - 配置选项
 * @param {PublicKeyCredentialCreationOptionsJSON} options.optionsJSON
 * - 来自 **@flun/webauthn-server** 的 `generateRegistrationOptions()` 的输出
 * @param {boolean} [options.useAutoRegister] - 尝试静默使用用户刚刚登录的密码管理器创建一个通行密钥,默认为 `false`
 * @returns {Promise<{
 *   id: string,
 *   rawId: string,
 *   response: {
 *     attestationObject: string,
 *     clientDataJSON: string,
 *     transports?: AuthenticatorTransport[],
 *     publicKeyAlgorithm?: COSEAlgorithmIdentifier,
 *     publicKey?: string,
 *     authenticatorData?: string
 *   },
 *   type: PublicKeyCredentialType,
 *   clientExtensionResults: AuthenticationExtensionsClientOutputs,
 *   authenticatorAttachment: AuthenticatorAttachment | null,
 *   native?: boolean  // 当在 Windows 下启用原生流程时返回 true
 * }>}
 */
const startRegistration = async (options) => {
    // 规范化传入的参数,兼容旧的调用方式
    const normalized = normalizeOptions(options);
    if (!normalized) throw new Error('startRegistration 需要传入包含 optionsJSON 或 challenge 的对象');
    options = normalized;

    const { optionsJSON, useAutoRegister = false } = options;
    // 若当前系统为 Windows,则直接返回模拟凭证数据,应用层可据此识别并调用底层 Windows Hello 接口;
    if (isWindows) {
        // 尝试从 optionsJSON.user.id 提取用户 ID,若无法提取则生成随机 UUID
        const userId = extractBase64Id(optionsJSON?.user) || crypto.randomUUID();
        return {
            id: userId,
            rawId: bufferToBase64URLString(base64URLStringToBuffer(userId)),
            response: {
                attestationObject: '', clientDataJSON: '', transports: [],
                publicKeyAlgorithm: -7, publicKey: '', authenticatorData: ''
            },
            type: 'public-key',
            clientExtensionResults: {},
            authenticatorAttachment: 'platform',
            native: true   // 标记为原生流程
        };
    }

    // 标准 WebAuthn 注册流程
    if (!browserSupportsWebAuthn()) throw new Error('此浏览器不支持 WebAuthn');
    const publicKey = {
        ...optionsJSON,
        challenge: base64URLStringToBuffer(optionsJSON.challenge),
        user: { ...optionsJSON.user, id: base64URLStringToBuffer(optionsJSON.user.id) },
        excludeCredentials: optionsJSON.excludeCredentials?.map(toPublicKeyCredentialDescriptor)
    }, createOptions = {};

    /**
     * 尝试使用条件创建（conditional create）为用户注册一个通行密钥,
     * 使用用户刚刚用于认证的密码管理器;浏览器不会向用户显示任何突出的 UI;
     * 注意：`mediation` 在 CredentialCreationOptions 中尚不存在,但自 2024 年 9 月起已可用
     */
    if (useAutoRegister) createOptions.mediation = 'conditional';
    createOptions.publicKey = publicKey, createOptions.signal = WebAuthnAbortService.createNewAbortSignal();

    let credential;
    try {
        credential = await navigator.credentials.create(createOptions);
    } catch (err) {
        throw identifyRegistrationError({ error: err, options: createOptions });
    }

    if (!credential) throw new Error('注册未完成');
    const { id, rawId, response, type } = credential;
    let transports = void 0;
    if (typeof response.getTransports === 'function') transports = response.getTransports();

    let responsePublicKeyAlgorithm = void 0;
    if (typeof response.getPublicKeyAlgorithm === 'function') {
        try {
            responsePublicKeyAlgorithm = response.getPublicKeyAlgorithm();
        } catch (error) { warnOnBrokenImplementation('getPublicKeyAlgorithm()', error); }
    }

    let responsePublicKey = void 0;
    if (typeof response.getPublicKey === 'function') {
        try {
            const _publicKey = response.getPublicKey();
            if (_publicKey !== null) responsePublicKey = bufferToBase64URLString(_publicKey);
        } catch (error) { warnOnBrokenImplementation('getPublicKey()', error); }
    }

    let responseAuthenticatorData;
    if (typeof response.getAuthenticatorData === 'function') {
        try {
            responseAuthenticatorData = bufferToBase64URLString(response.getAuthenticatorData());
        } catch (error) { warnOnBrokenImplementation('getAuthenticatorData()', error); }
    }

    return {
        id,
        rawId: bufferToBase64URLString(rawId),
        response: {
            attestationObject: bufferToBase64URLString(response.attestationObject),
            clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
            transports,
            publicKeyAlgorithm: responsePublicKeyAlgorithm,
            publicKey: responsePublicKey,
            authenticatorData: responseAuthenticatorData,
        },
        type,
        clientExtensionResults: credential.getClientExtensionResults(),
        authenticatorAttachment: toAuthenticatorAttachment(credential.authenticatorAttachment)
    };
};
export { startRegistration };