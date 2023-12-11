using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Net.Mail;
using TT.Camp.Common.Requests;
using TT.Camp.Infrastructure.Helpers;

namespace TT.Camp.Common.StaticResources
{
    public static class NotificationHelper
    {
        public static bool SendPasswordResetEmail(string emailAddress, string guid)
        {
            try
            {
                StringBuilder emailMessage = new StringBuilder();

                emailMessage.Append("<p>Hello,</p>");
                emailMessage.Append("<p>You have requested a password reset for the Tenant website.</p>");
                emailMessage.Append(string.Format("<p><a href='{0}?email={1}&token={2}'>Please click here to reset your password</a></p>", AppSettingConfigurations.AppSettings.ResetPasswordUrl, emailAddress, guid));
                emailMessage.Append("<p>If you did not request a password reset, please just ignore this email.");
                emailMessage.Append("<p>Thank you for using Tenant!</p>");

                SendEmailHelper.SendEmail(emailAddress, emailMessage, "Tenant - Password Reset Request", true);

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
        public static bool SendVerificationEmail(string emailAddress, string guid)
        {
            try
            {
                StringBuilder emailMessage = new StringBuilder();

                emailMessage.Append("<p>Hello,</p>");
                emailMessage.Append(string.Format("<p><a href='{0}?email={1}&token={2}'>Please click here to verify your email</a></p>", AppSettingConfigurations.AppSettings.VerifyEmailUrl, emailAddress, guid));
                emailMessage.Append("<p>Thank you for using Tenant!</p>");
                SendEmailHelper.SendEmail(emailAddress, emailMessage, "Tenant - Email verification", true);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}
