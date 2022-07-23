const User = require('../../models/user')

/* 
    GET /api/user/list
*/

exports.list = (req, res) => {
    // refuse if not an admin
    if(!req.decoded.admin) {
        return res.status(403).json({
            code: '403',
            message: 'you are not an admin'
        })
    }

    User.find({}, '-password').exec()
    .then(
        users=> {
            res.json({users})
        }
    )

}


/*
    POST /api/user/assign-admin/:username
*/
exports.assignAdmin = (req, res) => {
    console.log(req.params.email)
    // refuse if not an admin
    if(!req.decoded.admin) {
        return res.status(403).json({
            message: 'you are not an admin'
        })
    }

    User.findOneByUsername(req.params.email)
    .then(
        user => {
            if(!user) throw new Error('user not found')
            user.assignAdmin()
        }
    ).then(
        res.json({
            success: true
        })
    ).catch(
        (err) => { res.status(404).json({message: err.message})}
    )
}