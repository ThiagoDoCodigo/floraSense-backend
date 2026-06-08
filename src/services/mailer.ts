import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { TcpNetConnectOpts } from "net";
import { CustomError } from "../utils/errors/CustomError";

type SecureSMTPOptions = SMTPTransport.Options & TcpNetConnectOpts;

export class Mailer {
  private static mailOptions: SecureSMTPOptions = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  };

  private static transporter = nodemailer.createTransport(
    Mailer.mailOptions as SMTPTransport.Options,
  );

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
