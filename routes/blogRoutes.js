const requireLogin = require('../middlewares/requireLogin');
const mongoose= require('mongoose');
const Blog = mongoose.model('Blog');
const redis = require('redis');
const {cache} = require("express/lib/application");

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _id: req.params.id,
      _user: req.user.id
    });
    res.send(blog);
  });
/*
  app.get('/api/blogs', requireLogin, async (req, res) => {
    const blogs = await Blog.find({
      _user : req.user.id
    });
    res.send(blogs);
  });
*/

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const redisURL = "redis://127.0.0.1:6379";
    const client = redis.createClient({url:redisURL});
    client.on("error", err=>console.log("Redis Error", err));
    await client.connect();

    const cachedBlogs = await client.get(req.user.id);
    if(cachedBlogs){
        console.log("SERVING FROM CACHE");
        return res.send(JSON.parse(cachedBlogs));
    }

    console.log("SERVING FROM MONGODB");
    const blogs = await Blog.find({
        _user : req.user.id
    });
    res.send(blogs);
    await client.set(req.user.id, JSON.stringify(blogs), 'EX', 60);
    await client.disconnect();
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const {title, content} = req.body;
    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });
    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });

  app.delete('/api/blogs/:id', requireLogin, async (req, res) => {
    try {
      const blog = await Blog.findOneAndDelete({
        _id: req.params.id,
        _user: req.user.id
      });
      const blogs = await Blog.find({ _user: req.user.id })
      res.send(blogs);
    } catch (err) {
      res.status(500).send({ error: 'Failed to delete blog' });
    }
  });
};