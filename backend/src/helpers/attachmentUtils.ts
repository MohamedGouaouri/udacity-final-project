import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
// DONE


const s3BucketNameEnv = process.env.ATTACHMENT_S3_BUCKET
const urlExpirationEnv = process.env.SIGNED_URL_EXPIRATION

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({
            signatureVersion: 'v4'
        }),
        private readonly bucketName = s3BucketNameEnv,
        private readonly urlExpiration = urlExpirationEnv
    ) {

    }


    getAttachmentURL(todoId: string): string {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    }

    getUploadURL(todoId: string): string {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: parseInt(this.urlExpiration)
        })
    }

}