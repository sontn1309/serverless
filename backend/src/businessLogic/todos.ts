import 'source-map-support/register'

import { v4 as uuidv4 } from 'uuid';

import { TodosAccess } from '../dataLayer/TodosAccess'
import { TodosStorage } from '../dataLayer/TodosStorage'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todosAccess = new TodosAccess()
const todosStorage = new TodosStorage()

export async function getTodos(userId: string): Promise<TodoItem[]> {
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
  const item = await todosAccess.getTodoItem(todoId)

  if (!item)
    throw new Error('Item is not found')

  if (item.userId !== userId) {
    throw new Error('User is not authorized to update item')
  }

  todosAccess.updateTodoItem(todoId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  const item = await todosAccess.getTodoItem(todoId)

  if (!item)
    throw new Error('Item is not found')

  if (item.userId !== userId) {
    throw new Error('User is not authorized to delete item') 
  }

  todosAccess.deleteTodoItem(todoId)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {
    logger.info(`Generating upload URL for attachment ${attachmentId}`)
  
    const uploadUrl = await todosStorage.getUploadUrl(attachmentId)
  
    return uploadUrl
  }

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
  const attachmentUrl = await todosStorage.getAttachmentUrl(attachmentId)
  const item = await todosAccess.getTodoItem(todoId)
  if (!item)
    throw new Error('Item is not found')
  if (item.userId !== userId) {
    throw new Error('User is not authorized to update item')
  }
  await todosAccess.updateAttachmentUrl(todoId, attachmentUrl)
}
