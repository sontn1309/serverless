import { v4 as uuidv4 } from 'uuid';
import 'source-map-support/register'
import { TodosAccess } from '../dataLayer/TodosAccess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils';

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return await todosAccess.getTodoItems(userId)
}

export async function getTodosForUser(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
  const userId = getUserId(event);
  return await todosAccess.getTodoItems(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const todoId = uuidv4();
  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }
  await todosAccess.createTodoItem(newItem)

  return newItem
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {
  const item = await todosAccess.getTodoItem(todoId, userId)

  if (!item)
    throw new Error('Item is not found')
    
  await todosAccess.updateTodoItem(todoId, userId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  const item = await todosAccess.getTodoItem(todoId, userId)

  if (!item)
    throw new Error('Item is not found')

  await todosAccess.deleteTodoItem(todoId, userId)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {
    return await attachmentUtils.getUploadUrl(attachmentId)
  }

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
  const attachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId)
  const item = await todosAccess.getTodoItem(todoId, userId)
  if (!item)
    throw new Error('Item is not found')

  await todosAccess.updateAttachmentUrl(todoId, userId, attachmentUrl)
}
