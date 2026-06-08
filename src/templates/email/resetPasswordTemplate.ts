export const resetPasswordTemplate = {
  resetCode: (name: string, code: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2E8B57; margin-bottom: 0;">FloraSense</h2>
        <p style="color: #666666; margin-top: 4px;">Recuperação de Acesso</p>
      </div>
      
      <p>Olá, <strong>${name}</strong>.</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta. Utilize o código de segurança abaixo no aplicativo para criar uma nova senha:</p>
      
      <div style="background-color: #E8F5E9; padding: 24px; text-align: center; border-radius: 12px; margin: 32px 0; border: 1px solid #C8E6C9;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1B5E20; display: inline-block; margin-left: 8px;">
          ${code}
        </span>
      </div>
      
      <p style="font-size: 14px; color: #555555;">
        <strong>⏱️ Atenção:</strong> Este código é válido por apenas <strong>5 minutos</strong>.
      </p>
      
      <p style="font-size: 14px; color: #999999; margin-top: 32px; border-top: 1px solid #EEEEEE; padding-top: 16px;">
        Se você não solicitou esta alteração, por favor, ignore e exclua este e-mail. Nenhuma alteração será feita na sua conta.
      </p>
    </div>
  `,
};
