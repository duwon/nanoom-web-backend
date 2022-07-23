const bodyParser = require('body-parser')
const Bbs = require('../../models/bbs')

/* 
    GET /bbs/list
*/

exports.GetAllList = (req, res) => {

    Bbs.find({}, function(err, post) {
        if(err) {
            return res.status(201).json({
                code: '201',
                message: err,
            });
        }

        res.json({
            code: '200',
            message: '',
            results: post
        })
    }).sort({created: -1, })
}

/* 
    GET /bbs/:category/list
*/
exports.GetList = (req, res) => {

    // var findQuery = {}
    // if( req.query.category === 'all' ) findQuery = { }
    // else if( req.query.category ) findQuery = { category: req.query.category }
    // Bbs.find(findQuery, function(err, post){
    
    Bbs.find({category: req.params.category}, function(err, post){
        if(err) {
            return res.status(201).json({
                code: '201',
                message: err,
            });
        }
        if(post.length === 0) {
            return res.status(404).json({
                code: '404',
                message: err,
            });
        }

        return res.json({
            code: '200',
            message: '',
            results: post
        })
    }).sort({created: -1, })
}

/* 
    post /bbs/:category
*/
exports.Create = (req, res) => {
    var post = new Bbs();

    post.category = req.params.category;
    post.group = req.body.group;
    post.subject = req.body.subject;
    post.contents = req.body.contents;
    post.writer = {email: req.decoded.email, displayName: req.decoded.displayName};

    console.log(req.decoded)

    post.save(function(err){
        if(err){
            return res.status(201).json({
                code: '201',
                message: err,
            });
        }

        return res.json({
            code: '200',
            message: '',
            results: post
        })
    });
}

/* 
    post /bbs/:_id
*/
exports.Modify = (req, res) => {
    Bbs.updateOne({ _id: req.params._id }, { $set: req.body }, function(err, output){
        if(err) {
            return res.status(500).json({ 
                code: '500',
                message: err,
             });
        }

        if(!output.matchedCount) {
            return res.status(404).json({ 
                code: '400',
                message: 'post not found',
             });
        }

        return res.json( { 
            code: '200',
            message: '',
         } );
    })
}

/* 
    GET /bbs//detail/:id
*/
exports.DetailDocuments = (req, res) => {
   
    Bbs.find({ _id: req.params.id}, function(err, post){
        if(err) {
            return res.status(201).json({
                code: '201',
                message: err,
            });
        }
        if(post.length === 0) {
            return res.status(404).json({
                code: '404',
                message: err,
            });
        }

        post[0].hits = post[0].hits + 1
        Bbs.updateOne({ _id: post[0]._id }, { hits: post[0].hits }, function(err, output){
        })

        return res.json({
            code: '200',
            message: '',
            results: post
        })
    })
}