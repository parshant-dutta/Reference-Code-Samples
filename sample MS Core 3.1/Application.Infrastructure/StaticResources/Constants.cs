using System;
using System.Collections.Generic;
using System.Text;

namespace TT.Camp.Common.StaticResources
{
    public static class Constants
    {
        
        // Common
        public const string DEFAULT_ERROR_MSG = "Something went wrong";
        public const string NO_RECORD_FOUND = "Email does not exist.";

        // User 
        public const string LOGIN_FAILURE_MSG = "Username or password is incorrect";
        public const string EMAIL_ALREADY_EXIST = "Email already exists";
        public const string OLD_PASSWORD_INCORRECT = "Old password incorrect";
        public const string OLD_NEW_PASSWORD_SAME_ERROR = "New password can not be same as old password.";
        public const string PASSWORD_CHANGED = "Password changed successfully.";
        public const string RESET_PASSWORD_EMAIL = "Your password reset email has been sent.";
        public const string EMAIL_VERIFICATION = "Your email has been verified.";
        public const string RESET_LINK_EXPIRED = "The reset password link has been expired.";


        //Users Registration Screen
        public const string USER_CREATED = "User registered successfully.";
        public const string USER_UPDATED = "User  updated successfully.";
        
        //Email Errors
        public const string USER_REGISTRARION_ERROR = "Error while registering user";
        public const string EMAIL_ERROR = "Error while sending email";

        //Tenant Errors
        public const string TENANT_ERROR = "API key is not available";

    }
}
