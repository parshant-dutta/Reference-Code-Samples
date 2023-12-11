using System;
using System.Collections.Generic;
using System.Text;

namespace TT.Camp.Common.StaticResources
{
    public  class AppSettings
    {
        public string Secret { get; set; }
        public string ValidIssuer { get; set; }
        public string ValidAudience { get; set; }
        public string Timeout { get; set; }
        public Smtp smtp { get; set; }
        public string ConnectionString { get; set; }
        public string ResetPasswordUrl { get; set; }
        public string VerifyEmailUrl { get; set; }
    }
    public class Smtp
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class AppSettingConfigurations
    {
        public static AppSettings AppSettings { get; set; }
    }

}
