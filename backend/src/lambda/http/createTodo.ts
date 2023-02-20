import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { TodoItem } from '../../models/TodoItem'
import * as uuid from 'uuid'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    // DONE
    const todoId = uuid.v4()
    const userId = getUserId(event)
    //  Note: it's a good practice to split logic into data layer and processing layer or BL
    const newTodoItem: TodoItem = await createTodo(newTodo, todoId, userId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodoItem
      })
    }
  })

handler.use(
  cors({
    credentials: true,
    origin: '*'
  })
)
