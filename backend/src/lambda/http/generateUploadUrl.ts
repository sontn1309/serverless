import 'source-map-support/register'
import { v4 as uuidv4 } from 'uuid';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { generateUploadUrl, updateAttachmentUrl } from '../../businessLogic/todos'

import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('GenerateUploadUrl')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Return a presigned URL to upload a file for a TODO item with he provided id
    logger.info('GenerateUploadUrl. Event', { event })

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const attachmentId = uuidv4()
  
    const uploadUrl = await generateUploadUrl(attachmentId)
  
    await updateAttachmentUrl(userId, todoId, attachmentId)
  
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
  }