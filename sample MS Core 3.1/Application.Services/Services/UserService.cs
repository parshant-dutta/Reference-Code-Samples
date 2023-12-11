using AutoMapper;
using System;
using System.Threading.Tasks;
using TT.Camp.Common.Requests;
using TT.Camp.Common.Responses;
using TT.Camp.Common.StaticResources;
using TT.Camp.Data.Repository.IRepository;
using TT.Camp.Services.IServices;

namespace TT.Camp.Services.Services
{
    public class UserService : IUserService
    {
        #region readonly
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        #endregion       
        public UserService( IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }
        public async Task<UserResponse> Authenticate(UserLoginRequest loginRequest)
        {
            loginRequest.Password = EncryptDecryptHelper.GetMd5Hash(loginRequest.Password);
            var userDetails = await _userRepository.getUserDetails(loginRequest);
            if (userDetails == null) throw new Exception(Constants.LOGIN_FAILURE_MSG);
            var userResponse = _mapper.Map<UserResponse>(userDetails);
            return userResponse;
        }
        public async Task<UserResponse> RegisterUser(UserRegisterRequest userRequest)
        {
            userRequest.Password = EncryptDecryptHelper.GetMd5Hash(userRequest.Password);
            var userDetails = await _userRepository.registerUser(userRequest);

            if (userDetails == null) throw new Exception(Constants.EMAIL_ALREADY_EXIST);
            
            string guid = Guid.NewGuid().ToString();
            
            NotificationHelper.SendVerificationEmail(userRequest.Username, guid);

            var userResponse = _mapper.Map<UserResponse>(userDetails);
            return userResponse;
        }
        public async Task<UserResponse> ForgotPassword(ForgotPasswordRequest forgotPasswordRequest)
        {        
            forgotPasswordRequest.Token = Guid.NewGuid().ToString();
            var userDetails = await _userRepository.insertToken(forgotPasswordRequest);
            if (userDetails == null) throw new Exception(Constants.NO_RECORD_FOUND);              
            NotificationHelper.SendPasswordResetEmail(forgotPasswordRequest.Username, forgotPasswordRequest.Token);
                
            var userResponse = _mapper.Map<UserResponse>(userDetails);
            return userResponse;     
         }
        public async Task<UserResponse> ValidateToken(ForgotPasswordRequest validateResetPasswordRequest)
        {
            var userDetails = await _userRepository.validateToken(validateResetPasswordRequest);
            if (userDetails == null) throw new Exception(Constants.RESET_LINK_EXPIRED);

            var userResponse = _mapper.Map<UserResponse>(userDetails);
            return userResponse;
        }
        public async Task<UserResponse> ResetPassword(ModifyPasswordRequest modifyPasswordRequest)
        {            
            modifyPasswordRequest.NewPassword = EncryptDecryptHelper.GetMd5Hash(modifyPasswordRequest.NewPassword);

            var user = await _userRepository.checkUserExists(modifyPasswordRequest.Username, modifyPasswordRequest.APIKey);
            if (user == null) throw new Exception(Constants.NO_RECORD_FOUND);

            user.PasswordHash = modifyPasswordRequest.NewPassword;
            user.ResetTokenExpired = null;
            user.ResetToken = null;
            user.ModifiedBy = modifyPasswordRequest.Username;
            user.ModifiedOn = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
               
            var userResponse = _mapper.Map<UserResponse>(user);
            return userResponse;          
        }

        public async Task<UserResponse> ChangePassword(ModifyPasswordRequest modifyPasswordRequest)
        {         
            modifyPasswordRequest.NewPassword = EncryptDecryptHelper.GetMd5Hash(modifyPasswordRequest.NewPassword);
            modifyPasswordRequest.OldPassword = EncryptDecryptHelper.GetMd5Hash(modifyPasswordRequest.OldPassword);
           
            var user = await _userRepository.checkUserExists(modifyPasswordRequest.Username, modifyPasswordRequest.APIKey);

            if (user == null) throw new Exception(Constants.NO_RECORD_FOUND);

            if (user.PasswordHash != modifyPasswordRequest.OldPassword) throw new Exception(Constants.OLD_PASSWORD_INCORRECT);
            if (user.PasswordHash == modifyPasswordRequest.NewPassword) throw new Exception(Constants.OLD_NEW_PASSWORD_SAME_ERROR);

            user.PasswordHash = modifyPasswordRequest.NewPassword;
            user.ModifiedBy = modifyPasswordRequest.Username;
            user.ModifiedOn = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            var userResponse = _mapper.Map<UserResponse>(user);
            return userResponse;          
        }

        public async Task<UserResponse> VerifyEmail(VerifyEmailRequest verifyEmailRequest)
        {
            var userDetails = await _userRepository.verifyEmail(verifyEmailRequest);
            if (userDetails == null) throw new Exception(Constants.NO_RECORD_FOUND);
            var userResponse = _mapper.Map<UserResponse>(userDetails);
            return userResponse;
        }
       
    }
}
