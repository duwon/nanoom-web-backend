const jwt = require('jsonwebtoken')
const User = require('../../models/user')

/*
    POST /api/auth/register
    {
        email,
        password
    }
*/

exports.register = (req, res) => {
    const { email, password, displayName } = req.body
    let newUser = null

    // create a new user if does not exist
    const create = (user) => {
        // check email validation
        if(!validateEmail(email)) {
            throw new Error('정상적인 이메일이 아닙니다.')
        }

        // cehck password
        if(password.length < 6) {
            throw new Error('암호가 6자리 미만입니다.')
        }
        
        // check displayName
        if(checkEngNum(displayName)) {
            throw new Error('한글 이름만 입력하세요.')    
        }

        if(user) {
            throw new Error('이메일이 존재합니다.')
        } else {
            return User.create(email, password, displayName)
        }
    }

    // count the number of the user
    const count = (user) => {
        newUser = user
        return User.count({}).exec()
    }

    // assign admin if count is 1
    const assignAdmin = (count) => {
        if(count === 1) {
            return newUser.assignAdmin()
        } else {
            // if not, return a promise that returns false
            return Promise.resolve(false)
        }
    }

    // respond to the client
    const respond = (isAdmin) => {
        res.json({
            message: '등록 성공',
            admin: isAdmin ? true : false
        })
    }

    // run when there is an error (email exists)
    const onError = (error) => {
        res.status(409).json({
            message: error.message
        })
    }

    const validateEmail = (email) => {
        const check = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
        return check.test(email);
    }

    const checkEngNum = (str) => {
        const regExp = /[a-zA-Z0-9]/g;
        if(regExp.test(str)){
            return true;
        }else{
            return false;
        }
    }

    // check email duplication
    User.findOneByUsername(email)
    .then(create)
    .then(count)
    .then(assignAdmin)
    .then(respond)
    .catch(onError)
}

/*
    POST /api/auth/login
    {
        username,
        password
    }
*/

exports.login = (req, res) => {
    const {email, password} = req.body
    const secret = req.app.get('jwt-secret')

    // check the user info & generate the jwt
    const check = (user) => {
        if(!user) {
            // user does not exist
            throw new Error('login failed')
        } else {
            // user exists, check the password
            if(user.verify(password)) {
                // create a promise that generates jwt asynchronously
                const p = new Promise((resolve, reject) => {
                    jwt.sign(
                        {
                            _id: user._id,
                            email: user.email,
                            displayName: user.displayName,
                            admin: user.admin
                        }, 
                        secret, 
                        {
                            expiresIn: '7d',
                            issuer: 'nanoom.org',
                            subject: 'userInfo'
                        }, (err, token) => {
                            if (err) reject(err)
                            resolve(token) 
                        })
                })
                return p
            } else {
                throw new Error('login failed')
            }
        }
    }

    // respond the token 
    const respond = (token) => {
        res.json({
            message: 'logged in successfully',
            token
        })
    }

    // error occured
    const onError = (error) => {
        res.status(403).json({
            message: error.message
        })
    }

    // find the user
    User.findOneByUsername(email)
    .then(check)
    .then(respond)
    .catch(onError)

}

/*
    GET /api/auth/check
*/

exports.check = (req, res) => {
    res.json({
        code: '200',
        message: '',
        results: {
            _id: req.decoded._id,
            email: req.decoded.email,
            displayName: req.decoded.displayName,
            iat: req.decoded.iat,
            exp: req.decoded.exp,
        }
    })
}

/*
    Email Validation
*/
