using System;
using System.Linq;
using System.Threading.Tasks;
using TT.Camp.Common.Requests;
using TT.Camp.Core.Entities;
using TT.Camp.Data.Repository.IRepository;
using TT.Camp.Data.Repository.UnitOfWork;

namespace TT.Camp.Data.Repository.Repository
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(IUnitOfWork unitOfWork) : base(unitOfWork)
        {

        }
        public async Task<bool> checkUserEmailExist(string email)
        {
            string query = "select count(1) from users where UserName=@UserName";
            return await QueryScalarAsync(query, new { UserName = email });
        }
        public async Task<User> checkUserExists(string email,string apiKey)
        {
            string query = "SELECT * FROM users WHERE Username = @username and APIKey=@apikey and IsEmailConfirmed=true";
              var user = await QueryAsync(query, new { username = email, apikey = apiKey});
            return user.FirstOrDefault();
        }      
        public async Task<User> getUserDetails(UserLoginRequest loginRequest)
        {
            string query = "SELECT Id, FirstName, LastName, Username, IsEmailConfirmed from users where UserName=@Username and PasswordHash=@Password and APIKey=@APIKey and IsEmailConfirmed=true;";
            var user = await QueryAsync(query, new { UserName = loginRequest.Username, Password = loginRequest.Password, APIKey = loginRequest.APIKey });
            return user.FirstOrDefault();
        }
        public async Task<User> registerUser(UserRegisterRequest userRequest)
        {
            User user = new User();
            if (await checkUserEmailExist(userRequest.Username) == true) return null;
            user.Username = userRequest.Username;
            user.FirstName = userRequest.FirstName;
            user.LastName = userRequest.LastName;
            user.PasswordHash = userRequest.Password;
            user.CreatedOn = DateTime.UtcNow;
            user.CreatedBy = userRequest.Username;
            user.APIKey = userRequest.APIKey;
            await InsertAsync(user);
            return user;
          
        }
        public async Task<User> insertToken(ForgotPasswordRequest forgotPasswordRequest)
        {
           
                User user = new User();
                user = await checkUserExists(forgotPasswordRequest.Username, forgotPasswordRequest.APIKey);
                if (user != null)
                {
                    user.ResetToken = forgotPasswordRequest.Token;
                    user.ResetTokenExpired = DateTime.UtcNow.AddMinutes(60);
                    user.ModifiedBy = forgotPasswordRequest.Username;
                    user.ModifiedOn = DateTime.UtcNow;
                    await UpdateAsync(user);
                    return user;
                }
               
            
            return null;
                
        }
        public async Task<User> validateToken(ForgotPasswordRequest forgotPasswordRequest)
        {
            string query = "SELECT id FROM users WHERE Username =@userName and ResetToken =@token and ResetTokenExpired > UTC_TIMESTAMP()  and APIKey=@apikey and IsEmailConfirmed=true";
            var token= await QueryAsync(query, new { userName = forgotPasswordRequest.Username, token = forgotPasswordRequest.Token, apikey = forgotPasswordRequest.APIKey });
            return token.FirstOrDefault();
        }

        public async Task<User> verifyEmail(VerifyEmailRequest verifyEmailRequest)
        {
            if (await checkUserEmailExist(verifyEmailRequest.Username) == false) return null;           
                User user = new User();
                string query = "select * from users where username=@username";
                user = await GetAsync(query, new { username = verifyEmailRequest.Username });
                user.IsEmailConfirmed = true;
                user.ModifiedBy = verifyEmailRequest.Username;
                user.ModifiedOn = DateTime.UtcNow;
                await UpdateAsync(user);
               return user;
        }
        
    }
}
