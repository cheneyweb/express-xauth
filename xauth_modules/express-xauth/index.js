const jwt = require('jsonwebtoken')
const log = require('tracer').colorConsole()

module.exports = function (authConfig = {}, tokenRule, errorProcess) {
    return function xauth(req, res, next) {
        authConfig.tokenname = authConfig.tokenname || 'token'
        authConfig.pass = authConfig.pass || []
        authConfig.errMsg = authConfig.errMsg || '未认证'
        authConfig.errStatus = authConfig.errStatus || 401
        // 是否放行跨域OPTIONS请求
        if (authConfig.pass.cors && req.method == 'OPTIONS') {
            return next()
        }
        // 白名单内，直接返回
        if (authConfig.pass && authConfig.pass instanceof Array && authConfig.pass.length > 0) {
            for (let p of authConfig.pass) {
                const rep = new RegExp(p)
                if (rep.test(req.originalUrl)) {
                    return next()
                }
            }
        }
        // 从请求中获取TOKEN令牌
        let token = req.headers[authConfig.tokenname] || req.headers.token
        if (tokenRule) {
            token = tokenRule(token)
        }
        try {
            // 非白名单，进行校验
            const tokenVerify = jwt.verify(token, authConfig.secret)
            if (tokenVerify) {
                // 未配置角色控制，跳过
                if (!authConfig.role) {
                    req.tokenVerify = tokenVerify
                    return next()
                }
                // 已配置角色控制，则进一步进行角色身份检查，遍历角色所拥有的路由规则
                let roleRegArr = tokenVerify.role ? authConfig.role[tokenVerify.role] : null
                if (roleRegArr && roleRegArr instanceof Array && roleRegArr.length > 0) {
                    for (let item of roleRegArr) {
                        // 首先判断请求method是否匹配
                        if (item.indexOf(':') != '-1') {
                            if (item.split(':')[0] != req.method) {
                                continue
                            }
                            item = item.split(':')[1]
                        }
                        // 其次判断请求url是否匹配
                        const re = new RegExp(item)
                        if (re.test(req.originalUrl)) {
                            req.tokenVerify = tokenVerify
                            return next()
                        }
                    }
                    // 额外可选错误处理
                    if (errorProcess && typeof (errorProcess) == 'function') {
                        errorProcess(req, res)
                    } else {
                        // 失败：所有路由规则循环完毕均不能匹配
                        res.status(authConfig.errStatus).send({ err: true, res: `角色：[${tokenVerify.role}]未拥有访问权限` })
                    }
                }
                // 失败：角色拥有路由规则为空
                else {
                    // 额外可选错误处理
                    if (errorProcess && typeof (errorProcess) == 'function') {
                        errorProcess(req, res)
                    } else {
                        res.status(authConfig.errStatus).send({ err: true, res: `角色：[${tokenVerify.role}]未配置访问权限` })
                    }
                }
            }
            // 失败：TOKEN解析失败
            else {
                // 额外可选错误处理
                if (errorProcess && typeof (errorProcess) == 'function') {
                    errorProcess(req, res)
                } else {
                    res.status(authConfig.errStatus).send({ err: true, res: authConfig.errMsg })
                }
            }
        } catch (error) {
            // 额外可选错误处理
            if (errorProcess && typeof (errorProcess) == 'function') {
                errorProcess(req, res)
            } else {
                res.status(authConfig.errStatus).send({ err: true, ...error })
            }
            log.error(error)
        }
    }
}