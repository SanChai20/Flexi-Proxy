踩坑记录

1. redirect会绕过middleware中间件处理
2. Vercel会剔除掉Authorization请求头，是因为Base Url没有配置www. 导致重定向了，所以配置成www.xxx.com就可以了