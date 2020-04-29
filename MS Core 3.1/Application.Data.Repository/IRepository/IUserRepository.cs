using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TT.Camp.Common.Requests;
using TT.Camp.Common.Responses;
using TT.Camp.Core.Entities;

namespace TT.Camp.Data.Repository.IRepository
{
    public interface IUserRepository : IBaseRepository<User>
    {
        Task<User> checkUserExists(string Username, string APIKey);
        Task<User> getUserDetails(UserLoginRequest loginRequest);
        Task<User> registerUser(UserRegisterRequest userRequest);
        Task<User> insertToken(ForgotPasswordRequest forgotPasswordRequest);
        Task<User> validateToken(ForgotPasswordRequest validateResetPasswordRequest);
        Task<User> verifyEmail(VerifyEmailRequest verifyEmailRequest);
        
    }
}
