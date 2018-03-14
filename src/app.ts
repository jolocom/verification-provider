import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Verifier } from './verifier';

export function createApp({
  emailVerifier,
  phoneVerifier
} : {
  emailVerifier : Verifier,
  phoneVerifier : Verifier
}) {
  const app = express()

  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
  })

  const verifiers : Verifier[] = [emailVerifier, phoneVerifier]
  verifiers.forEach((verifier : Verifier) => {

    app.post(`/${verifier.attrType}/start-verification`, async (req, res) => {
      try {
        console.log(`Starting ${verifier.attrType} verification.`)
        await verifier.startVerification({ claim: req.body.claim })
        res.send('OK')
      } catch(e) {
        console.error(e)
        console.error(e.stack)
        res.send('Error')
      }
    })

    app.post(`/${verifier.attrType}/finish-verification`, async (req, res) => {
      try {
        console.log(`Finishing ${verifier.attrType} verification.`)
        const result = await verifier.verify({
          identity: req.body.identity,
          attrType: req.body[verifier.attrType],
          code: req.body.code
        })

        if (result) {
          res.json(result)
        } else {
          res.status(422).send('Could not verify the code.')
        }
      } catch (e) {
        console.error(e)
        console.error(e.stack)
        res.status(422).send(`Error: ${e.message}`)
      }
    })
  })

  return app
}
