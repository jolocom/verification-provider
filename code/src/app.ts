const express = require('express')
const bodyParser = require('body-parser')
import { Verifier } from './verifier';

export function createApp({emailVerifier, phoneVerifier} :
                          {emailVerifier : Verifier, phoneVerifier : Verifier})
{
  const app = express()
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
  })

  const verifiers = [emailVerifier, phoneVerifier]
  verifiers.forEach(verifier => {
    app.post(`/${verifier.attrType}/start-verification`, async (req, res) => {
      try {
        await verifier.startVerification({
          contractID: req.body.contractID,
          attrValue: req.body[verifier.attrType]
        })
        res.send('OK')
      } catch(e) {
        console.error(e)
        console.error(e.stack)
        res.send('Error')
      }
    })

    app.post(`/${verifier.attrType}/verify`, async (req, res) => {
      try {
        const result = await verifier.verify({
          contractID: req.body.contractID,
          attrValue: req.body[verifier.attrType],
          code: req.body.code
        })

        if (result) {
          res.send('OK')
        } else {
          res.send('Error')
        }
      } catch (e) {
        console.error(e)
        console.error(e.stack)
        res.send('Error')
      }
    })
  })

  return app
}
