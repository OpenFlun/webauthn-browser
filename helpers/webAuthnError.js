/**
 * 自定义错误,用于在调用 `navigator.credentials.create()` 或 `navigator.credentials.get()` 后,
 * 更细致地说明规范中描述的八种错误之一被抛出的原因:
 *
 * - `AbortError`
 * - `ConstraintError`
 * - `InvalidStateError`
 * - `NotAllowedError`
 * - `NotSupportedError`
 * - `SecurityError`
 * - `TypeError`
 * - `UnknownError`
 *
 * 错误消息通过研究规范确定,以了解在哪些场景下会抛出特定错误;
 * - 查看定义:@see {@link WebAuthnError}
 */
class WebAuthnError extends Error {
    /**
     * @param {Object} params - 错误配置参数
     * @param {string} params.message - 错误消息
     * @param {string} params.code - 错误码(规范中定义的错误名称之一)
     * @param {Error} [params.cause] - 导致此错误的原始错误对象
     * @param {string} [params.name] - 自定义错误名称,默认使用 cause 的 name
     */
    constructor({ message, code, cause, name }) {
        super(message, { cause }), this.name = name ?? cause.name, this.code = code;
    }
}

export { WebAuthnError };