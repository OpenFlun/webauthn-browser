/**
 * WebAuthn 中止服务的基础类
 * >查看定义:@see {@link BaseWebAuthnAbortService}
 */
class BaseWebAuthnAbortService {
    constructor() {
        /**
         * 当前活动的 AbortController 实例
         * @type {AbortController | undefined}
         */
        this.controller = undefined;
    }

    /**
     * 创建新的 AbortSignal,并中止任何进行中的 WebAuthn 仪式
     *
     * @returns {AbortSignal} 可用于 `navigator.credentials.create()` 或 `navigator.credentials.get()` 的 `signal` 选项
     */
    createNewAbortSignal() {
        // 中止任何现有的 navigator.credentials.create() 或 navigator.credentials.get() 调用
        if (this.controller) {
            const abortError = new Error('取消当前 WebAuthn API 调用,使用新的调用');
            abortError.name = 'AbortError', this.controller.abort(abortError);
        }
        const newController = new AbortController();
        this.controller = newController;
        return newController.signal;
    }

    /**
     * 手动取消当前正在进行的 WebAuthn 仪式
     * @returns {void}
     */
    cancelCeremony() {
        if (this.controller) {
            const abortError = new Error('手动取消现有的 WebAuthn API 调用');
            abortError.name = 'AbortError', this.controller.abort(abortError), this.controller = undefined;
        }
    }
}

/**
 * 服务单例,用于确保同一时间只有一个 WebAuthn 仪式处于活动状态;
 * **@flun/webauthn-browser** 的使用者通常不需要使用此服务,但它可以帮助
 * 使用客户端路由的项目开发者更好地控制其用户体验以响应路由导航事件;
 * - 查看定义:@see {@link WebAuthnAbortService}
 *
 * @type {BaseWebAuthnAbortService}
 */
const WebAuthnAbortService = new BaseWebAuthnAbortService();

export { WebAuthnAbortService, BaseWebAuthnAbortService };