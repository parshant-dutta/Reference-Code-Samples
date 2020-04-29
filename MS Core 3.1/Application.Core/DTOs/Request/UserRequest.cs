using System.ComponentModel.DataAnnotations;

namespace TT.Camp.Common.Requests
{
    public class UserLoginRequest: BaseRequest
    {
        [Required]
        public string Username { get; set; }

        [Required]
        [MinLength(8)]
        public string Password { get; set; }
    }
    public class UserRegisterRequest : BaseRequest
    {
        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        [MinLength(8)]
        public string Password { get; set; }
    }
    public class ForgotPasswordRequest : BaseRequest
    {
        [Required]
        public string Username { get; set; }
        public string Token { get; set; }
    }
    public class ModifyPasswordRequest : BaseRequest
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
        public string Username { get; set; }
    }
    public class VerifyEmailRequest : BaseRequest
    {
        [Required]
        public string Username { get; set; }
    }
   
}
