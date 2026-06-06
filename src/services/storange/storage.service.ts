import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { CustomError } from "../../utils/errors/CustomError";

export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private projectId: string;

  constructor() {
    this.projectId = process.env.SUPABASE_PROJECT_ID || "";
    this.bucketName = process.env.SUPABASE_BUCKET_NAME || "floraSense";
    const region = process.env.AWS_REGION || "us-east-1";

    if (!this.projectId) {
      throw new Error("SUPABASE_PROJECT_ID ausente no .env");
    }

    this.s3Client = new S3Client({
      forcePathStyle: true,
      region,
      endpoint: `https://${this.projectId}.supabase.co/storage/v1/s3`,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
  }

  public async uploadImage(
    plantId: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    try {
      const fileName = `${plantId}.jpg`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);
    } catch (err: any) {
      console.error("[AWS S3 Upload Error]:", err);
      throw new CustomError("Erro interno ao salvar a imagem.", 500);
    }
  }

  public async deleteImage(plantId: string): Promise<void> {
    try {
      const fileName = `${plantId}.jpg`;
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      await this.s3Client.send(command);
    } catch (err) {
      throw new CustomError("Erro ao remover a imagem antiga.", 500);
    }
  }

  public getImageUrl(plantId: string, updatedAt: Date): string {
    const fileName = `${plantId}.jpg`;
    const url = `https://${this.projectId}.supabase.co/storage/v1/object/public/${this.bucketName}/${fileName}`;
    return `${url}?v=${new Date(updatedAt).getTime()}`;
  }
}

export default new StorageService();
