/**
 * 将 Base64URL 编码的字符串转换为数组缓冲区; 最适合在将凭据 ID 从 JSON 字符串转换为 ArrayBuffer 时使用,
 * 例如在 allowCredentials 或 excludeCredentials 中;
 * 与 `bufferToBase64URLString` 配对使用;
 * - 查看定义:@see {@link base64URLStringToBuffer}
 * @param {string} base64URLString - Base64URL 编码的字符串
 * @returns {ArrayBuffer} 转换后的 ArrayBuffer
 */
const base64URLStringToBuffer = base64URLString => {
    // 从 Base64URL 转换为标准 Base64
    const base64 = base64URLString.replace(/-/g, '+').replace(/_/g, '/'),
        /**
         * 用 '=' 填充,直到长度是 4 的倍数
         * (4 - (85 % 4 = 1) = 3) % 4 = 3 个填充
         * (4 - (86 % 4 = 2) = 2) % 4 = 2 个填充
         * (4 - (87 % 4 = 3) = 1) % 4 = 1 个填充
         * (4 - (88 % 4 = 0) = 4) % 4 = 0 个填充
         */
        padLength = (4 - (base64.length % 4)) % 4, padded = base64.padEnd(base64.length + padLength, '='),
        // 转换为二进制字符串并将二进制字符串转换为缓冲区
        binary = atob(padded), buffer = new ArrayBuffer(binary.length), bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return buffer;
}

/**
 * 将给定的数组缓冲区转换为 Base64URL 编码的字符串;适用于将各种凭证响应的 ArrayBuffer
 * 转换为字符串,以便作为 JSON 发送回服务器;
 * 与 `base64URLStringToBuffer` 搭配使用
 * - 查看定义:@see {@link bufferToBase64URLString}
 * @param {BufferSource} buffer - 要转换的 ArrayBuffer 或 ArrayBufferView
 * @returns {string} Base64URL 编码的字符串(不含填充符)
 */
const bufferToBase64URLString = buffer => {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (const charCode of bytes) str += String.fromCharCode(charCode);

    const base64String = btoa(str);
    return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export { base64URLStringToBuffer, bufferToBase64URLString };