import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'
import 'source-map-support/register'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

AWS.config.update({
    region: "us-west-2",
});

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosByUserIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async todoItemExists(todoId: string, userId: string): Promise<boolean> {
    const item = await this.getTodoItem(todoId, userId)
    return !!item
  }

async getTodoItems(userId: string): Promise<TodoItem[]> {

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosByUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
    return result.Items as TodoItem[]
  }

  async getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      }
    }).promise()

    return result.Item as TodoItem
  }

  async createTodoItem(todoItem: TodoItem) {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem,
    }).promise()
  }

  async updateTodoItem(todoId: string, userId :string, todoUpdate: TodoUpdate) {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": todoUpdate.name,
        ":dueDate": todoUpdate.dueDate,
        ":done": todoUpdate.done
      }
    }).promise()   
  }

  async deleteTodoItem(todoId: string, userId: string) {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      }
    }).promise()    
  }

  async updateAttachmentUrl(todoId: string, userId: string, attachmentUrl: string) {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }
}