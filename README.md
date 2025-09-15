踩坑记录

1. redirect会绕过middleware中间件处理
2. Vercel会剔除掉Authorization请求头，是因为Base Url没有配置www. 导致重定向了，所以配置成www.xxx.com就可以了
3. JWT用于认证，JWT 不能防止别人看到 API Key，只能防止别人改 API Key。可以用来存放:
    根据业务需求添加，比如：

    - user_id: 用户唯一标识
    - email: 用户邮箱
    - role: 用户角色（如 admin, editor）
    - permissions: 权限列表
4. API Key需要加密处理，才可以上传数据库



Adapter
    //
    AdapterPrefix:UserId:[UniqueId] - {
        TokenKey = tk
        providerId = pid
        providerUrl = pul
        Note = not
    }
    //
    AdapterPrefix:TokenKey - {
        [Hide] UserId = uid
        [Hide] iv(ApiKey) = kiv
        [Hide] encryptedData(ApiKey) = ken
        [Hide] authTag(ApiKey) = kau
        [展示] BaseUrl = url
        [展示] ModelId = mid
    }


Provider

    ProviderPrefix:[ProviderId] - {
        providerUrl = pul
    }