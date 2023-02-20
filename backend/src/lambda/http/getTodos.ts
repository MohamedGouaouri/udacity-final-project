import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'


import { getUserId } from '../utils';
import { getAllTodos } from '../../businessLogic/todos'
import { TodoItem } from '../../models/TodoItem'


// TODO: Get all TODO items for a current user
// DONE
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId: string = getUserId(event)
    const todos: TodoItem[] = await getAllTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos,
      })
    }
  })

handler.use(
  cors({
    credentials: true,
    origin: '*'
  })
)
