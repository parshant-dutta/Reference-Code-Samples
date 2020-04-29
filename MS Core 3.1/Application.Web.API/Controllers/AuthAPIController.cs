using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using TT.Camp.Common.Requests;
using TT.Camp.Common.Responses;
using TT.Camp.Common.StaticResources;
using TT.Camp.Core.Entities;
using TT.Camp.Services.IServices;
using TT.Camp.Web.API.Controllers.Base;

namespace TT.Camp.Web.API.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AuthAPIController : BaseTenantResolverController
    {
        #region readonly
        private readonly IUserService _userService;
        #endregion

        #region private
        #endregion

        public AuthAPIController(
            IHttpContextAccessor httpContextAccessor, 
            ITenantService tenantService,
            IUserService userService
        ) : base(httpContextAccessor, tenantService)
        {
            _userService = userService;
        }

        [HttpPost]
        public async Task<ActionResult> Login([FromBody]UserLoginRequest login)
        {
            try
            {
                var mainResponse = await CheckTenantDetails();
                if (mainResponse.Status == false)
                {
                    _json = Mapper.convert<Tenant>(mainResponse);
                    return BadRequest(_json);
                }

                login.Host = _host;
                login.APIKey = mainResponse.tenantResponse.APIKey;             
                var userResponse = await _userService.Authenticate(login);
                userResponse.token = GenerateJSONWebToken(userResponse.Id, login.Username);
                userResponse.Status = true;
                mainResponse.userResponse = userResponse;
                _json = Mapper.convert<UserResponse>(_response);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = Mapper.convert<UserResponse>(_response);
                return BadRequest(_json);
            }
        }
        [HttpPost]
        public async Task<ActionResult> Register([FromBody]UserRegisterRequest register)
        {
            try
            {
                var mainResponse = await CheckTenantDetails();
                if (mainResponse.Status == false)
                {
                    _json = Mapper.convert<Tenant>(mainResponse);
                    return BadRequest(_json);
                }
                register.Host = _host;
                register.APIKey = mainResponse.tenantResponse.APIKey;
                var userResponse = await _userService.RegisterUser(register) ;
                userResponse.Status = true;
                userResponse.Message = Constants.USER_CREATED;
                _json = Mapper.convert<UserResponse>(_response);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = Mapper.convert<UserResponse>(_response);
                return BadRequest(_json);
            }
        }
        [HttpPost]
        public async Task<ActionResult> ForgotPassword([FromBody]ForgotPasswordRequest forgotPasswordRequest)
        {
            try
            {
                var mainResponse = await CheckTenantDetails();

                if (mainResponse.Status == false)
                {
                    _json = Mapper.convert<Tenant>(mainResponse);
                    return BadRequest(_json);
                }
                forgotPasswordRequest.Host = _host;
                forgotPasswordRequest.APIKey = mainResponse.tenantResponse.APIKey;
                var userResponse = await _userService.ForgotPassword(forgotPasswordRequest);
                userResponse.Status = true;
                userResponse.Message =Constants.RESET_PASSWORD_EMAIL;
                _json = Mapper.convert<UserResponse>(_response);
                return new OkObjectResult(_json);
            
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = Mapper.convert<UserResponse>(_response);
                return BadRequest(_json);
            }
        }
        [HttpPost]
        public async Task<ActionResult> ValidateToken([FromBody]ForgotPasswordRequest validateResetPasswordRequest)
        {
            try
            {
                var mainResponse = await CheckTenantDetails();

                if (mainResponse.Status == false)
                {
                    _json = Mapper.convert<Tenant>(mainResponse);
                    return BadRequest(_json);
                }
                validateResetPasswordRequest.Host = _host;
                validateResetPasswordRequest.APIKey = mainResponse.tenantResponse.APIKey;
                var userResponse = await _userService.ValidateToken(validateResetPasswordRequest);
                userResponse.Status = true;
                _json = Mapper.convert<UserResponse>(_response);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = Mapper.convert<UserResponse>(_response);
                return BadRequest(_json);
            }
        }
        [HttpPost]
        public async Task<ActionResult> ResetPassword([FromBody]ModifyPasswordRequest modifyPasswordRequest)
        {
            try
            {
                var mainResponse = await CheckTenantDetails();

                if (mainResponse.Status == false)
                {
                    _json = Mapper.convert<Tenant>(mainResponse);
                    return BadRequest(_json);
                }           
                modifyPasswordRequest.Host = _host;
                modifyPasswordRequest.APIKey = mainResponse.tenantResponse.APIKey;
                var userResponse = await _userService.ResetPassword(modifyPasswordRequest);
                userResponse.Status = true; 
                userResponse.Message = Constants.PASSWORD_CHANGED; 
                _json = Mapper.convert<UserResponse>(_response);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = Mapper.convert<UserResponse>(_response);
                return BadRequest(_json);
            }
        }
        [HttpPost]
        public async Task<ActionResult> ChangePassword([FromBody]ModifyPasswordRequest modifyPasswordRequest)
        {
            try
            {
                var mainResponse = await CheckTenantDetails();
                if (mainResponse.Status == false)
                {
                    _json = Mapper.convert<Tenant>(mainResponse);
                    return BadRequest(_json);
                }

                modifyPasswordRequest.Host = _host;
                modifyPasswordRequest.APIKey = mainResponse.tenantResponse.APIKey;
                var userResponse = await _userService.ChangePassword(modifyPasswordRequest);
                userResponse.Status = true;
                userResponse.Message = Constants.PASSWORD_CHANGED;
                _json = Mapper.convert<UserResponse>(_response);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = Mapper.convert<UserResponse>(_response);
                return BadRequest(_json);
            }
        }
        [HttpPost]
        public async Task<ActionResult> VerifyEmail([FromBody]VerifyEmailRequest verifyEmailRequest)
        {
            try
            {
                var mainResponse = await CheckTenantDetails();

                if (mainResponse.Status == false)
                {
                    _json = Mapper.convert<Tenant>(mainResponse);
                    return BadRequest(_json);
                }
                verifyEmailRequest.Host = _host;
                verifyEmailRequest.APIKey = mainResponse.tenantResponse.APIKey;
                var userResponse = await _userService.VerifyEmail(verifyEmailRequest);
                userResponse.Status = true;
                userResponse.Message = Constants.EMAIL_VERIFICATION;
                _json = Mapper.convert<UserResponse>(_response);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = Mapper.convert<UserResponse>(_response);
                return BadRequest(_json);
            }
        }
        #region JWT Functions
        private string GenerateJSONWebToken(int userId, string email)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(AppSettingConfigurations.AppSettings.Secret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.UniqueName, email),
                new Claim(JwtRegisteredClaimNames.NameId, Convert.ToString(userId)),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
             };

            var token = new JwtSecurityToken(AppSettingConfigurations.AppSettings.ValidIssuer,
                                            AppSettingConfigurations.AppSettings.ValidAudience,
                                            claims,
                                            expires: DateTime.Now.AddMinutes(Convert.ToInt32(AppSettingConfigurations.AppSettings.Timeout)),
                                            signingCredentials: credentials
                                            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        #endregion
    }
}