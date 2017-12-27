// 系统配置参数
const config = require('config')
const port = config.server.port
// 应用服务相关
const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const xauth = require(__dirname + '/xauth_modules/express-xauth/index.js')
// 日志相关
const log = require('tracer').colorConsole({ level: config.log.level })

// 初始化应用服务
const app = new express()
app.use(bodyParser.json())
app.use(xauth(config.auth, (v) => v))   // 参数1：认证配置，参数2：TOKEN提取规则
app.use(router)

// ===== 开始：用户认证中间件例子，‘/auth’已经配置白名单，‘/test’路由受保护 =====
// 1、模拟用户登录，生成加密TOKEN令牌
router.use('/auth', async function (req, res, next) {
    try {
        if (true) { // 判断用户名密码等认证方式，这里默认通过
            const user = { userId: '123', role: 'admin' }
            const tokenSign = await jwt.sign({  // exp设置过期时间，这里是24小时
                ...user, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
            }, config.auth.secret)
            req.tokenSign = tokenSign // 向后面的路由传递TOKEN加密令牌
            next()
        } else {
            res.status(401).send('用户名或密码错误')
        }
    } catch (error) {
        console.error(error)
        res.send(error)
    }
})
// 2、向前端传递TOKEN加密令牌
router.get('/auth', async function (req, res) {
    res.send(req.tokenSign)
})
// 3、下次其余路由需要在请求时在header中加上token参数，如果没有token或者token错误，xauth中间件会提示错误
router.get('/test', async function (req, res) {
    res.send(req.tokenVerify) // 获取TOKEN解析结果
})

// 路由角色控制
router.get('/financial/test1', async function (req, res) {
    res.send(req.tokenVerify)
})
router.post('/financial/test1', async function (req, res) {
    res.send(req.tokenVerify)
})
router.get('/financial/test2', async function (req, res) {
    res.send(req.tokenVerify)
})
// ===== 结束：用户认证中间件例子，‘/auth’已经配置白名单，‘/test’路由受保护 =====

// 启动应用服务
app.listen(port)
log.info(`XAuth服务启动【执行环境:${process.env.NODE_ENV},端口:${port}】`)
log.info(`用户登录认证路径【GET】【localhost:${port}/auth】`)
log.info(`受保护的路由路径【GET】【localhost:${port}/test】`)