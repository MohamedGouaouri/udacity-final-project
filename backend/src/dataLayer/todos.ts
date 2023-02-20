import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'


const XAWS = AWSXRay.captureAWS(AWS)


const logger = createLogger('Todo Access')

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX
    ) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Fetching all todos for userId', { userId: userId })

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        logger.info("All todos fetched")

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {

        logger.info("Creating new todo object");
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        logger.info("Create todo complete.")

        return todo
    }

    async updateTodo(todoId: string, userId: string, newTodo: TodoUpdate) {
        logger.info("Updating todo:", {
            todoId: todoId,
            updatedTodo: newTodo
        });

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': newTodo.name,
                ':dueDate': newTodo.dueDate,
                ':done': newTodo.done
            },
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ReturnValues: 'ALL_NEW'

        }).promise()

        logger.info("Update complete.")

        return newTodo
    }

    async updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string) {
        logger.info(`Updating todoId ${todoId} with attachmentUrl ${attachmentUrl}`)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            }

        }).promise()
    }


    async deleteTodo(todoId: string, userId: string) {
        logger.info("Deleting todo:", { todoId: todoId });
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise()

        logger.info("Delete complete.", { todoId: todoId });
        return todoId

    }
}