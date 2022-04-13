import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')
// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('GetTodos. Event', { event })
    // Write your code here
    const todos = await getTodosForUser(event);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      todos
    })
  }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
