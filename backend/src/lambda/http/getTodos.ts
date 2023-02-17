import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

// import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

// TODO: Get all TODO items for a current user
// Done
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const todos = (await docClient.scan({
      TableName: todosTable
    }).promise()).Items

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        todos,
        userId: getUserId(event)
      })
    }
  })
handler.use(
  cors({
    credentials: true
  })
)
