import { base64URLStringToBuffer } from './base64urlAndBuffer.js';

/**
 * 将描述符中的 Base64URL 字符串 `id` 转换为 ArrayBuffer,以适配 WebAuthn API;
 * - 查看定义:@see {@link toPublicKeyCredentialDescriptor}
 * @param {Object} descriptor - 包含 `id` (Base64URL 字符串) 的凭证描述符;
 * @param {string} descriptor.id - 凭证 ID(Base64URL 编码)
 * @param {string[]} [descriptor.transports] - 可选的传输方式列表(如 ['usb', 'nfc'])
 * @returns {PublicKeyCredentialDescriptor} 转换后的描述符,可直接用于 WebAuthn;
 */
const toPublicKeyCredentialDescriptor = descriptor => {
    const { id } = descriptor;
    return {
        ...descriptor, id: base64URLStringToBuffer(id),
        /**
         * `descriptor.transports` 是一个包含较新传输方式的数组,这些传输方式属于我们的 `AuthenticatorTransportFuture` 类型,
         * 而 TypeScript 的 DOM 库对此尚不了解;让 TS 相信我们的传输方式列表可以传递给 WebAuthn,因为浏览器会识别这些新值;
         */
        transports: descriptor.transports,
    };
}

export { toPublicKeyCredentialDescriptor };