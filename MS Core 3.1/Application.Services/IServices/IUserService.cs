using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TT.Camp.Core.Entities;
using TT.Camp.Common.Requests;
using TT.Camp.Common.Responses;

namespace TT.Camp.Services.IServices
{
    public interface IUserService
    {
        Task<UserResponse> Authenticate(UserLoginRequest login);
        Task<UserResponse> RegisterUser(UserRegisterRequest register);
        Task<UserResponse> ForgotPassword(ForgotPasswordRequest forgotPasswordRequest);
        Task<UserResponse> ValidateToken(ForgotPasswordRequest validateResetPasswordRequest);
        Task<UserResponse> ResetPassword(ModifyPasswordRequest modifyPasswordRequest);
        Task<UserResponse> ChangePassword(ModifyPasswordRequest modifyPasswordRequest);
        Task<UserResponse> VerifyEmail(VerifyEmailRequest verifyEmailRequest);
    }
}
