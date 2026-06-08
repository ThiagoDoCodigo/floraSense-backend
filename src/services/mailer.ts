import nodemailer from "nodemailer";
import { CustomError } from "../utils/errors/CustomError";

export class Mailer {
  private static transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  static async send(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `FloraSense <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      console.error("====== ERRO REAL DO NODEMAILER ======", error);

      throw new CustomError(
        "Não foi possível enviar o e-mail no momento. Tente novamente mais tarde.",
        500,
      );
    }
  }
}
