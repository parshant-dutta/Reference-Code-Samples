using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Text;
using TT.Camp.Common.Requests;
using TT.Camp.Common.StaticResources;

namespace TT.Camp.Infrastructure.Helpers
{
    public static class SendEmailHelper
    {
        public static void SendEmail(string emailAddress, StringBuilder emailMessage, string subject, bool html)
        {
            try
            {
                

                MailMessage email = new MailMessage();
                email.From = new MailAddress(AppSettingConfigurations.AppSettings.smtp.Username, "Tenant");
                email.To.Add(new MailAddress(emailAddress));
                email.Subject = subject;
                email.Body = emailMessage.ToString();
                email.IsBodyHtml = html;

                SmtpClient smtpServer = new SmtpClient();
                smtpServer.Host = AppSettingConfigurations.AppSettings.smtp.Host;
                smtpServer.UseDefaultCredentials = false;
                smtpServer.Port = AppSettingConfigurations.AppSettings.smtp.Port;
                smtpServer.Credentials = new NetworkCredential(AppSettingConfigurations.AppSettings.smtp.Username, AppSettingConfigurations.AppSettings.smtp.Password);
                smtpServer.EnableSsl = true;
                smtpServer.DeliveryMethod = System.Net.Mail.SmtpDeliveryMethod.Network;
                smtpServer.Send(email);
            }
            catch (Exception ex)
            {
                throw (ex);
            }
        }
    }
}
