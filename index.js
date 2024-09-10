const express = require('express');
const keys = require('./config/keys');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const passport = require('passport');

require("./models/User");
require("./models/Blog");
// Service passport
require('./services/passport');

mongoose.connect(keys.mongoURI)

const app = express();
// CORS configuration
const corpsOption = {
  origin: 'http://localhost:3000',
  methods: 'GET, PUT, DELETE, POST, HEAD, PATCH',
  credentials: true, // permet d'envoyer des cookies et sessions
  optionSuccessStatus: 204
};

app.use(cors(corpsOption))

// COOKIES & SESSIONS
app.use(bodyParser.json());
app.use(
    cookieSession({
        maxAge: 24*60*60*1000*30,
        keys: [keys.cookieKey]
    })
)
app.use(passport.initialize());
app.use(passport.session());


// TODO SWAGGER DOC

require('./routes/authRoutes')(app);
require('./routes/blogRoutes')(app);


app.get('/', (req, res) => {
  res.send('Salut!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Le serveur ecoute sur le port: `, PORT);
});