using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;
using DitsPortal.Common.StaticResources;
using DitsPortal.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace DitsPortal.API.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
   
    public class AuthAPIController : ControllerBase
    {
        #region readonly
        private readonly IUserService _userService;
        #endregion
        #region private
        private IOptions<AppSettings> _settings;
        private UserProfileResponse _UserProfileResponse;
        private MainResponse _response;
        private MainUserResponse _mainUserResponse;
        private string _json = string.Empty;
        #endregion
        #region constructor
        public AuthAPIController(IUserService userService, IOptions<AppSettings> settings)
        {
            _settings = settings;
            _userService = userService;
            _response = new MainResponse();
        }
        #endregion
        [HttpPost]
        public ActionResult Login([FromBody]UserLoginRequest login)
        {
            try
            {
                _response = _userService.Authenticate(login);

                if (_response.Status == false)
                {
                    _json = Mapper.convert<UserResponse>(_response);
                    return BadRequest(_json);
                }

                _response.userResponse.token = GenerateJSONWebToken(_response.userResponse.UserId, login.Email);

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
                _response = await _userService.RegisterUser(register);

                if (_response.Status == false)
                {
                    _json = Mapper.convert<UserResponse>(_response);
                    return BadRequest(_json);
                }

                _response.userResponse.token = GenerateJSONWebToken(_response.userResponse.UserId, register.Email);

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
        public async Task<ActionResult> ChangePassword([FromBody]ChangePasswordRequest changePasswordRequest)
        {
            try
            {
                changePasswordRequest.UserName = User.Identity.Name;
                _response = await _userService.ChangePassword(changePasswordRequest);

                if (_response.Status == false)
                {
                    _json = Mapper.convert<UserResponse>(_response);
                    return BadRequest(_json);
                }
             
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
        public async Task<ActionResult> SetResetPasswordToken([FromBody]ForgotPasswordRequest forgotPasswordRequest)
        {
            try
            {
                SmtpRequest conf = new SmtpRequest();
                conf.Host = _settings.Value.smtp.Host;
                conf.Port = _settings.Value.smtp.Port;
                conf.UserName = _settings.Value.smtp.Username;
                conf.Password = _settings.Value.smtp.Password;

                _response = await _userService.SetResetPasswordToken(forgotPasswordRequest, conf);

                if (_response.Status == false)
                {
                    _json = Mapper.convert<UserResponse>(_response);
                    return BadRequest(_json);
                }

                _response.userResponse.token = GenerateJSONWebToken(_response.userResponse.UserId, forgotPasswordRequest.Email);

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
        public ActionResult ValidateResetPasswordToken([FromBody]ValidateResetPasswordRequest validateResetPasswordRequest)
        {
            try
            {
                _response =  _userService.ValidateResetPasswordToken(validateResetPasswordRequest);

                if (_response.Status == false)
                {
                    _json = Mapper.convert<UserResponse>(_response);
                    return BadRequest(_json);
                }

                _response.userResponse.token = GenerateJSONWebToken(_response.userResponse.UserId, validateResetPasswordRequest.Email);

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
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Value.Secret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.UniqueName, email),
                new Claim(JwtRegisteredClaimNames.NameId, Convert.ToString(userId)),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
             };

            var token = new JwtSecurityToken(_settings.Value.ValidIssuer,
                                            _settings.Value.ValidAudience,
                                            claims,
                                            expires: DateTime.Now.AddMinutes(Convert.ToInt32(_settings.Value.Timeout)),
                                            signingCredentials: credentials
                                            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        #endregion
        [HttpPost]
        public async Task<ActionResult> UserAccountApprove([FromBody]AccountApproveRequest accountApproveRequest)
        {
            try
            {
                _mainUserResponse = await _userService.UserAccountApprove(accountApproveRequest);
                return new OkObjectResult(_mainUserResponse);
            }
            catch (Exception ex)
            {
                _mainUserResponse.Message = ex.Message;
                _mainUserResponse.Status = false;
                return BadRequest(_mainUserResponse);
            }
        }
    }
}