import { bufferToBase64URLString } from './base64urlAndBuffer.js';
/**
 * 检测当前操作系统是否为 Windows,
 * 用于在 Windows 平台下启用原生 Windows Hello 认证流程
 * > 查看定义:@see {@link isWindows}
 */
const isWindows = (() => {
    const ua = navigator.userAgent || '';
    return /Windows/i.test(ua) || /Win32/i.test(ua) || /Win64/i.test(ua);
})();

/**
 * 从包含凭证 ID 的对象中提取 base64url 格式的 ID 字符串
 * 支持多种 ID 表示形式（字符串、Uint8Array、Buffer 序列化对象等）
 * > 查看定义:@see {@link extractBase64Id}
 * @param {Object} obj - 包含 `id` 属性的对象
 * @returns {string|undefined} base64url 编码的 ID 字符串，或 undefined
 */
const extractBase64Id = obj => {
    if (!obj) return undefined;
    const id = obj.id;
    if (typeof id === 'string') return id;
    if (id && typeof id === 'object' && id.type === 'Buffer' && Array.isArray(id.data))
        return bufferToBase64URLString(Uint8Array.from(id.data));
    if (id instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(id)))
        return bufferToBase64URLString(id);
    return undefined;
};

/**
 * 规范化传入的 options 对象,兼容旧调用方式
 * - 若传入 { optionsJSON } 则原样返回
 * - 若传入 { challenge, ... } 则包装为 { optionsJSON: input }
 * - 否则返回 null
 * > 查看定义:@see {@link normalizeOptions}
 * @param {Object} [input] - 用户传入的 options，应包含 optionsJSON 或 challenge 属性
 * @returns {Object|null} 规范化后的对象（至少包含 optionsJSON 属性）或 null
 */
const normalizeOptions = input => {
    if (!input) return null;
    if (input.optionsJSON) return input;
    if (input.challenge) return { optionsJSON: input };
    return null;
};
export { isWindows, extractBase64Id, normalizeOptions };