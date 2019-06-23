const mongoose = require('mongoose')
mongoose.connect('mongodb://y.onecoder.space:27017/myblog', {
  useNewUrlParser: true
}) //y.onecoder.space:27017
const conn = mongoose.connection
conn.on('connected', function () {
  console.log('mongodb is connected')
})

const userSchema = mongoose.Schema({
  username: {type: String, required: true}, 
  password: {type: String, required: true}, 
  email: {type: String, required: true}, 
  avatar: {type: String, require: true},
  registerTime: {type: String, require: true},
  userComments: {type: Number, require: true},
})
const UserModel = mongoose.model('user', userSchema)
exports.UserModel = UserModel

const postSchema = mongoose.Schema({
  title: {type: String, required: true}, 
  content: {type: String, required: true}, 
  posterId: {type: String, required: true},
  postTime: {type: String, require: true},
  posterName: {type: String, require: true},
  posterAvatar: {type: String, require: true},
  posterEmail: {type: String, require: true},
  html: {type: String, require: true},
  commentCount: {type: Number, require: true},
  zan: {type: Number, require: true},
  star: {type: Number, require: true},
})
const PostModel = mongoose.model('post', postSchema)
exports.PostModel = PostModel

const CommentSchema = mongoose.Schema({
  avatar: {type: String, required: true},
  author: {type: String, required: true},
  content: {type: String, required: true},
  datetime: {type: String, required: true},
  postTitle: {type: String, required: true},
  who: {type: String, required: true},
  to: {type: String, required: true},
})
const CommentModel = mongoose.model('comment', CommentSchema)
exports.CommentModel = CommentModel