const http = require('http');
const cors = require('cors');
const { OAuth2Strategy } = require('passport-google-oauth');
const express = require('express');
const session = require('express-session');
const sessionFileStore = require('session-file-store');
const passport = require('passport');
const socketio = require('socket.io')
const { oAuth: oAuthConfig, session: sessionConfig } = require('../config');
const { initializeCache } = require('./data-access');
const authRouter = require('./routers/auth');
const albumsRouter = require('./routers/albums');

const app = express();
const FileStore = sessionFileStore(session);

app.use(express.json())
app.use(passport.initialize())
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
passport.use(new OAuth2Strategy(
  oAuthConfig,
  // TODO: save the user to the database in this callback
  (token, refreshToken, profile, done) => done(null, { profile, token },
)));
app.use(cors({ origin: 'http://localhost:3000' })); // TODO: change for production
app.use(session({ ...sessionConfig, store: new FileStore({}) }));

app.use('/auth', authRouter);
app.use('/albums', albumsRouter);

async function startServer() {
  await initializeCache();
  const server = http.createServer(app)
  const io = socketio(server);
  app.set('io', io);
  server.listen(8080, () => console.log('listening on port 8080!'));
};

startServer();