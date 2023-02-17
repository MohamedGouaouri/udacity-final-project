import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode, JwtHeader, VerifyErrors } from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import * as JwksRsa from 'jwks-rsa'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-fl71ve0pcd3ast8v.us.auth0.com/.well-known/jwks.json'

const client = new JwksClient({
  jwksUri: jwksUrl
})

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  // Get token from request
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  /*
    1) Retrieve the public key from the jwksUrl endpoint:
    Send a GET request to the jwksUrl endpoint to retrieve the public key associated with the JWT token's issuer. The response will contain a JSON object with an array of keys. You can find the public key that corresponds to the key ID (kid) specified in the JWT token header.

    2) Decode the JWT token:
    Decode the JWT token using a JWT library in your programming language of choice. The header of the decoded token will contain the key ID (kid) that corresponds to the public key you retrieved from the jwksUrl endpoint.

    3) Verify the JWT token signature:
    Use the public key you retrieved from the jwksUrl endpoint to verify the signature of the JWT token. The signature verification method will depend on the JWT library you are using.

    4)Verify the JWT token claims:
    Verify the claims in the JWT token according to your application's requirements, such as the issuer, audience, and expiration time.
  */

  let payload: Promise<JwtPayload>
  verify(token, getKey, (err: VerifyErrors, decoded: JwtPayload) => {
    payload.then(() => {
      return decoded
    }).catch(() => {
      return err
    })
  })
  return payload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

function getKey(header: JwtHeader, callback) {
  client.getSigningKey(header.kid, (err: Error, key?: JwksRsa.SigningKey) => {
    let signingKey = key.getPublicKey()
    callback(null, signingKey)
  })
}