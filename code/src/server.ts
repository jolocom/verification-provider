const express = require('express')
const bodyParser = require('body-parser')
import { EmailVerifier } from './email-verifier';

export function createServer({emailVerifier} : {emailVerifier : EmailVerifier}) {
  const app = express()
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())

  app.post('/email/start-verification', (req, res) => {
    emailVerifier.startVerification({
      userID: req.body.webID,
      email: req.body.email
    })
    res.send('OK')
  })
  
  app.post('/email/verify', (req, res) => {
    emailVerifier.verify({
      userID: req.body.webID,
      email: req.body.email,
      code: req.body.code
    })
    res.send('OK')
  })
  
  return app
}
