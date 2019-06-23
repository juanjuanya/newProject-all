var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5')
const { UserModel, PostModel, CommentModel } = require('../db/mongodb')
const filter = {password: 0}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', (req, res) => {
  const { username, password, email, avatar } = req.body
  const registerTime = Date.now()
  const userComments = 0
  UserModel.findOne({username}, (err, user) => {
    if (user) {
      res.send({code: 1, msg: '此用户以存在'})
    } else {
      new UserModel({username, password: md5(password), email, avatar, registerTime, userComments}).save((err, user) => {
        res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7})
        res.send({code: 0, data: {_id: user._id, username, avatar, email, registerTime, userComments}})
      })
    }
  })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body
  UserModel.findOne({username, password: md5(password)}, filter, (err, user) => {
    if (!user) {
      res.send({code: 1, msg: '用户名或密码错误'})
    } else {
      res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7})
      res.send({code: 0, data: user})
    }
  })
})

router.get('/user', (req, res) => {
  const userid = req.cookies.userid
  if (!userid) {
    return res.send({code: 1, msg: '请先登录'})
  }
  UserModel.findOne({_id: userid}, filter, (err, user) => {
    return res.send({code: 0, data: user})
  })
})

router.post('/post', (req, res) => {
  const {title, content, posterId, html} = req.body
  const postTime = Date.now()
  UserModel.findOne({_id: posterId}, filter, (err, user) => {
    const newPost = {title, content, posterId, postTime, html, 
      posterName: user.username, posterAvatar: user.avatar, posterEmail: user.email, commentCount: 0, zan: 0, star: 0}
    new PostModel(newPost).save((err, post) => {
      res.send({code: 0, data: post})
    })
  })
})

router.get('/postlist', (req, res) => {
  PostModel.find((err, posts) => {
    posts = posts.sort((a, b) => b.postTime - a.postTime)
    res.send({code: 0, data: posts})
  })
})

router.post('/viewpost', (req, res) => {
  const {_id} = req.body
  PostModel.findOne({_id}, (err, post) => {
    res.send({code: 0, data: post})
  })
})

router.post('/comment', (req, res) => {
  const {val, time, to, who, len, postTitle} = req.body
  UserModel.findOne({_id: who}, filter, (err, user) => {
    const {avatar, username} = user
    const newComment = {avatar, author: username, content: val, datetime: time, to, who, postTitle}
    PostModel.findByIdAndUpdate({_id: to}, {commentCount: len}, (err, doc) => {})
    new CommentModel(newComment).save((err, comment) => {
      res.send({code: 0, data: comment})
    })
  })
})

router.post('/comments', (req, res) => {
  const { _id } = req.body
  CommentModel.find((err, comments) => {
    const newComments = comments.filter(comment => comment.to === _id ? true : false).reverse()
    res.send({code: 0, data: newComments})
  })
})

router.post('/updatePost', (req, res) => {
  const {type, count, _id} = req.body
  if (type === "star-o") {
    PostModel.findByIdAndUpdate({_id}, {star: count},{new: true} , (err, post) => {
      res.send({code: 0, data: post})
    })
  } else if (type === "like-o") {
    PostModel.findByIdAndUpdate({_id}, {zan: count}, {new: true}, (err, post) => {
      res.send({code: 0, data: post})
    })
  }
})

router.post('/updateUser', (req, res) => {
  const {_id, count} = req.body
  UserModel.findByIdAndUpdate({_id}, {userComments: count}, {new: true}, (err, user) => {
    res.send({code: 0, data: user})
  })
})

router.get('/allComments', (req, res) => {
  const userid = req.cookies.userid
  CommentModel.find((err, comments) => {
    const newComments = comments.filter(comment => comment.who === userid ? true : false).reverse()
    res.send({code: 0, data: newComments})
  })
})

router.post('/deletePost', (req, res) => {
  const {_id} = req.body
  PostModel.deleteOne({_id}, (err, doc) => {
    CommentModel.deleteMany({to: _id}, (err, doc) => {
      PostModel.find((err, posts) => {
        posts = posts.sort((a, b) => b.postTime - a.postTime)
        res.send({code: 0, data: posts})
      })
    })
  })
})

router.post('/deleteComment', (req, res) => {
  const {_id, to} = req.body
  console.log(_id, to)
  CommentModel.deleteOne({_id}, (err, doc) => {
    const userid = req.cookies.userid
    PostModel.findByIdAndUpdate({_id: to}, {$inc: {commentCount: - 1}}, {new: true}, (err, doc) => {
      console.log(doc)
      CommentModel.find((err, comments) => {
        const newComments = comments.filter(comment => comment.who === userid ? true : false).reverse()
        res.send({code: 0, data: newComments})
      })
    })
  })
})


module.exports = router;
