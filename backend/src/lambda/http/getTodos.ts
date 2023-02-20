import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'

// const XAWS = AWSXRay.captureAWS(AWS)

// import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
// import { getUserId } from '../utils';
// import { getAllTodos } from '../../businessLogic/todos'
// import { TodoItem } from '../../models/TodoItem'


const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
// const todosIndex = process.env.TODOS_CREATED_AT_INDEX

// TODO: Get all TODO items for a current user
// DONE
export const handler = middy(
  async (_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    // const userId: string = getUserId(event)
    // const todos: TodoItem[] = await getAllTodos(userId)
    // const todos = [{ userId, todoId: 'todoId' }]
    const result = await docClient.scan({
      TableName: todosTable,
      // IndexName: todosIndex,
      // KeyConditionExpression: 'userId = :userId',
      // ExpressionAttributeValues: {
      //   ':userId': userId
      // }
    }).promise()

    // logger.info("All todos fetched")

    const items = result.Items
    // return items as TodoItem[]

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: items,
      })
    }
  })

handler.use(
  cors({
    credentials: true,
    origin: '*'
  })
)
