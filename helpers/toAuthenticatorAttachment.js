const attachments = ['cross-platform', 'platform'];
/**
 * 尝试将 `string` 值强制转换为已知的 `AuthenticatorAttachment` 类型
 * - 查看定义:@see {@link toAuthenticatorAttachment}
 * @param {string} attachment - 待转换的字符串
 * @returns {'cross-platform' | 'platform' | undefined} 如果是合法的认证器附着类型则返回对应字符串,否则返回 undefined;
 */
const toAuthenticatorAttachment = attachment => {
    if (!attachment) return;
    if (attachments.indexOf(attachment) < 0) return;
    return attachment;
}

export { toAuthenticatorAttachment };