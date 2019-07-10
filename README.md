# express-xauth
Node后端微服务框架，基于express-xauth中间件，TOKEN令牌式身份认证集成

[传送门：XServer官网文档](http://www.xserver.top)

框架目录结构
>
    ├── app.js
    ├── config
    │   ├── default.json
    │   ├── develop.json
    │   └── production.json
    ├── node_modules
    ├── package.json
    └── xauth_modules
        └── express-xauth

快速上手
>
```js
    1、const xauth = require('express-xauth')
    2、app.use(xauth())
    3、router.get('/test', async (req, res) => {
        res.send(req.tokenVerify)  // [req.tokenVerify]是token解析后的对象
    })
```

配置说明
>
    在/config/default.json中，有如下配置
```json
"auth": {
        "secret": "cheneyweb",  #必须，TOKEN密钥
        "tokenname": "token",   #可选，header中请求的TOKEN键名，默认为"token"
        "pass": ["/auth"],      #可选，白名单路由数组，正则匹配
        "role":{                #可选，角色拥有路由权限数组，正则匹配（启用该功能需要在token中增加role属性）
            "admin":[".*"],     
            "financialAdmin":["/financial/*"],
            "financialManager":["/financial/test1","/financial/test2"],
            "financialStaff":["GET:/financial/test1","POST:/financial/test2"]
        }
    }
```

帮助联系
>
	作者:cheneyxu
	邮箱:457299596@qq.com
	QQ:457299596

更新日志
>
	2017.12.27:初版
    2018.10.29:升级所有依赖
    2019.01.15:升级所有依赖
    2019.07.10:升级所有依赖