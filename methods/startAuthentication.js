import {
    bufferToBase64URLString, base64URLStringToBuffer, browserSupportsWebAuthn, browserSupportsWebAuthnAutofill,
    isWindows, extractBase64Id, normalizeOptions, identifyAuthenticationError, toAuthenticatorAttachment,
    toPublicKeyCredentialDescriptor, WebAuthnAbortService
} from '../helpers/index.js';

/**
 * 通过 WebAuthn 断言开始身份验证器“登录”
 * > 查看定义:@see {@link startAuthentication}
 * @param {Object} options - 配置选项
 * @param {Object} options.optionsJSON - 来自 **@flun/webauthn-server** 的 `generateAuthenticationOptions()` 的输出
 * @param {boolean} [options.useBrowserAutofill=false] - 初始化条件式 UI,以支持通过浏览器自动填充提示进行登录
 * @param {boolean} [options.verifyBrowserAutofillInput=true] - 当 `useBrowserAutofill` 为 `true` 时,确保存在合适的 `<input>` 元素
 * @param {string} [options.accountId] - （可选）手动指定账号 ID,用于 Windows 原生认证时作为凭证标识,若未提供则从 `optionsJSON.allowCredentials` 中提取
 * @returns {Promise<{
 *   id: string,
 *   rawId: string,
 *   response: {
 *     authenticatorData: string,
 *     clientDataJSON: string,
 *     signature: string,
 *     userHandle?: string
 *   },
 *   type: string,
 *   clientExtensionResults: AuthenticationExtensionsClientOutputs,
 *   authenticatorAttachment: string,
 *   native?: boolean  // 当在 Windows 下启用原生流程时返回 true
 * }>}
 */
const startAuthentication = async (options) => {
    const normalized = normalizeOptions(options);
    if (!normalized) throw new Error('startAuthentication 需要传入包含 optionsJSON 或 challenge 的对象');
    options = normalized;

    const { optionsJSON, useBrowserAutofill = false, verifyBrowserAutofillInput = true, accountId: userId } = options;
    // 若当前系统为 Windows,则直接返回模拟凭证数据,应用层可据此识别并调用底层 Windows Hello 接口;
    if (isWindows) {
        // 优先使用显式传入的 accountId,否则从 allowCredentials 中提取第一个凭证的 ID
        const accountId = userId || extractBase64Id(optionsJSON?.allowCredentials?.[0]);
        if (!accountId) throw new Error('未找到硬件凭证 ID,请确认已注册设备或使用备用码登录');
        return {
            id: accountId,
            rawId: bufferToBase64URLString(base64URLStringToBuffer(accountId)),
            response: { authenticatorData: '', clientDataJSON: '', signature: '', userHandle: '' },
            type: 'public-key',
            clientExtensionResults: {},
            authenticatorAttachment: 'platform',
            native: true   // 标记为原生流程
        };
    }
    // 标准 WebAuthn 认证流程
    if (!browserSupportsWebAuthn()) throw new Error('此浏览器不支持 WebAuthn');
    let allowCredentials;
    if (optionsJSON.allowCredentials?.length !== 0)
        allowCredentials = optionsJSON.allowCredentials?.map(toPublicKeyCredentialDescriptor);

    const publicKey = { ...optionsJSON, challenge: base64URLStringToBuffer(optionsJSON.challenge), allowCredentials },
        getOptions = {};
    if (useBrowserAutofill) {
        if (!(await browserSupportsWebAuthnAutofill())) throw Error('浏览器不支持 WebAuthn 自动填充');

        const eligibleInputs = document.querySelectorAll("input[autocomplete$='webauthn']");
        if (eligibleInputs.length < 1 && verifyBrowserAutofillInput)
            throw Error('未检测到任何 `autocomplete` 属性中包含 "webauthn"（作为唯一值或最后一个值）的 <input> 元素');

        getOptions.mediation = 'conditional', publicKey.allowCredentials = [];
    }
    getOptions.publicKey = publicKey, getOptions.signal = WebAuthnAbortService.createNewAbortSignal();

    let credential;
    try {
        credential = await navigator.credentials.get(getOptions);
    } catch (err) {
        throw identifyAuthenticationError({ error: err, options: getOptions });
    }
    if (!credential) throw new Error('身份验证未完成');

    const { id, rawId, response, type } = credential;
    let userHandle = undefined;
    if (response.userHandle) userHandle = bufferToBase64URLString(response.userHandle);

    return {
        id,
        rawId: bufferToBase64URLString(rawId),
        response: {
            authenticatorData: bufferToBase64URLString(response.authenticatorData),
            clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
            signature: bufferToBase64URLString(response.signature),
            userHandle,
        }, type, clientExtensionResults: credential.getClientExtensionResults(),
        authenticatorAttachment: toAuthenticatorAttachment(credential.authenticatorAttachment),
    };
};
export { startAuthentication };