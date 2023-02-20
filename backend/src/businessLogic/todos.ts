import { TodoAccess } from "../dataLayer/todos";
import { AttachmentUtils } from "../helpers/attachmentUtils";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";

const attachmentUtils = new AttachmentUtils()
const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodos(userId)
}

export async function createTodo(newTodo: CreateTodoRequest, todoId: string, userId: string) {
    const createdAt: string = new Date().toISOString()
    const s3AttachmentUrl: string = attachmentUtils.getAttachmentURL(todoId)
    return await todoAccess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: createdAt,
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        done: false,
        attachmentUrl: s3AttachmentUrl
    })
}

export async function updateTodo(todoId: string, userId: string, newTodo: TodoUpdate) {
    return await todoAccess.updateTodo(
        todoId,
        userId,
        newTodo
    )
}

export async function deleteTodo(userId: string, todoId: string) {
    return await todoAccess.deleteTodo(todoId, userId)
}


export function createAttachmentPresignedUrl(todoId: string): string {
    return attachmentUtils.getUploadURL(todoId)
}