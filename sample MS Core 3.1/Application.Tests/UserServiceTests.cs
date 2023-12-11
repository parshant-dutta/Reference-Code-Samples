using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using TT.Camp.Common.StaticResources;
using TT.Camp.Common.Requests;
using TT.Camp.Common.Responses;
using TT.Camp.Data.Repository.IRepository;
using TT.Camp.Data.Repository.Repository;
using TT.Camp.Services.IServices;
using TT.Camp.Services.Services;
using Xunit;
using Xunit.Extensions.Ordering;
using TT.Camp.AutoMapper.Mappings;
using TT.Camp.Data.Repository.UnitOfWork;
using TT.Camp.Web.API.Controllers;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace TT.Camp.Tests
{
    public class UserServsiceTest
    {
        public readonly IUserRepository _userRepository;
        public readonly IMapper _mapper;
        public readonly UnitOfWork _unitOfWork;
        public readonly AuthAPIController _authAPIController;
        public readonly IHttpContextAccessor _httpContextAccessor;
        ITenantService _tenantService;
        IUserService _userService;
        ITenantRepository _tenantRepository;

        private HttpContext _context;

        public UserServsiceTest()
        {
            var mappingConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(new AutoMapping());
            });

            _unitOfWork = new UnitOfWork("Server=localhost;Port=3306;User Id=root;Database=tenantdb");
            _userRepository = new UserRepository(_unitOfWork);
            _mapper = mappingConfig.CreateMapper();

            _context = new DefaultHttpContext();

            _httpContextAccessor = new HttpContextAccessor();
            _httpContextAccessor.HttpContext = _context;
            var hostString = new HostString("http://localhost:5000", 5000);

            _httpContextAccessor.HttpContext.Request.Host = hostString;
            _tenantRepository = new TenantRepository(_unitOfWork);
            _tenantService = new TenantService(_tenantRepository, _mapper);
            _userService = new UserService(_userRepository, _mapper);
            _authAPIController = new AuthAPIController(_httpContextAccessor, _tenantService, _userService);
        }

        //Test Case 1
        //Registering for new user.
        [Fact, Order(1)]
        public void RegisterUser_CreateNewUser_CompareStatusAndMessage()
        {
            var request = new UserRegisterRequest();
            var smtp = new Smtp();
            request.APIKey = "APIKEY";
            request.FirstName = "FirstName";
            request.LastName = "LastName";
            request.Username = "";         //Enter "Receiver's" email address here
            request.Password = "Password";
            request.Host = "5000";
            smtp.Host = "smtp.gmail.com";
            smtp.Port = 587;
            smtp.Username = "";           //Enter "Sender's" email here
            smtp.Password = "";                  //Enter "Sender's" password here
            var expectedStatus = "True";
            var response = _authAPIController.Register(request);
            var jsonString = JsonConvert.SerializeObject(response.Result);
            JObject obj = JObject.Parse(jsonString);
            BaseResponse baseResponse = JsonConvert.DeserializeObject<BaseResponse>((string)obj.SelectToken("Value"));
            var status = Convert.ToString(baseResponse.Status);
            Assert.Matches(expectedStatus, status);
        }

        //Test Case 2
        //Confirming email.
        [Fact, Order(2)]
        public void ConfirmEmail_ChangeValueOfIsEmailConfirmed_CompareStatus()
        {
            var request = new VerifyEmailRequest();
            request.Username = "";         //Enter "Receiver's" email address here
            var expectedStatus = "True";
            var response = _userService.VerifyEmail(request);
            var IsEmailConfirmed = (response.Result.IsEmailConfirmed).ToString();
            Assert.Matches(expectedStatus, IsEmailConfirmed);
        }

        //Test Case 3
        //Login with actual Username and Password in the database
        [Fact, Order(3)]
        public void Authenticate_LoginWithCredentials_CompareStatus()
        {
            var request = new UserLoginRequest();
            AppSettings appSettings = new AppSettings();
            Smtp smtp = new Smtp();
            request.Username = "";         //Enter "Receiver's" email address here
            request.Password = "Password";
            request.Host = "5000";
            request.APIKey = "APIKEY";
            appSettings.Secret = "testingstring12345";
            appSettings.ValidIssuer = "test.com";
            appSettings.ValidAudience = "test.com";
            appSettings.VerifyEmailUrl = "http://localhost:8080/verify-email";
            //appSettings.
            smtp.Host = "smtp.gmail.com";
            smtp.Port = 587;
            smtp.Username = "";
            smtp.Password = "";
            appSettings.smtp = smtp;
            AppSettingConfigurations.AppSettings = appSettings;
            var expectedStatus = "True";
            var response = _authAPIController.Login(request);
            var jsonString = JsonConvert.SerializeObject(response.Result);
            JObject obj = JObject.Parse(jsonString);
            BaseResponse baseResponse = JsonConvert.DeserializeObject<BaseResponse>((string)obj.SelectToken("Value"));
            var status = Convert.ToString(baseResponse.Status);
            Assert.Matches(expectedStatus, status);
        }

        //Test Case 4 
        //Login without Username and Password
        [Fact, Order(4)]
        public void Authenticate_LoginWithoutCredentials_CompareStatusAndMessage()
        {
            var request = new UserLoginRequest();
            request.APIKey = "APIKEY";
            request.Username = "";
            request.Password = "";
            request.Host = "5000";
            AppSettings appSettings = new AppSettings();
            Smtp smtp = new Smtp();
            appSettings.Secret = "testingstring12345";
            appSettings.ValidIssuer = "test.com";
            appSettings.ValidAudience = "test.com";
            appSettings.VerifyEmailUrl = "http://localhost:8080/verify-email";
            smtp.Host = "smtp.gmail.com";
            smtp.Port = 587;
            smtp.Username = "";
            smtp.Password = "";
            var expectedMessage = "Username or password is incorrect";
            var expectedStatus = "False";
            var response = _authAPIController.Login(request);
            var jsonString = JsonConvert.SerializeObject(response.Result);
            JObject obj = JObject.Parse(jsonString);
            BaseResponse baseResponse = JsonConvert.DeserializeObject<BaseResponse>((string)obj.SelectToken("Value"));
            var status = Convert.ToString(baseResponse.Status);
            var message = Convert.ToString(baseResponse.Message);
            Assert.Matches(expectedStatus, status);
            Assert.Matches(expectedMessage, message);
        }

        //Test Case 5
        //Login with wrong Username and Password
        [Fact, Order(5)]
        public void Authenticate_LoginWithWrongCredentials_CompareStatusAndMessage()
        {
            var request = new UserLoginRequest();
            request.APIKey = "APIKEY";
            request.Username = "WrongUsername";          //Wrong Username
            request.Password = "WrongPassword";          //Wrong Password
            request.Host = "5000";
            AppSettings appSettings = new AppSettings();
            Smtp smtp = new Smtp();
            appSettings.Secret = "testingstring12345";
            appSettings.ValidIssuer = "test.com";
            appSettings.ValidAudience = "test.com";
            appSettings.VerifyEmailUrl = "http://localhost:8080/verify-email";
            smtp.Host = "smtp.gmail.com";
            smtp.Port = 587;
            smtp.Username = "";
            smtp.Password = "";
            var expectedStatus = "False";
            var expectedMessage = "Username or password is incorrect";

            var response = _authAPIController.Login(request);
            var jsonString = JsonConvert.SerializeObject(response.Result);
            JObject obj = JObject.Parse(jsonString);
            BaseResponse baseResponse = JsonConvert.DeserializeObject<BaseResponse>((string)obj.SelectToken("Value"));
            var status = Convert.ToString(baseResponse.Status);
            var message = Convert.ToString(baseResponse.Message);
            Assert.Matches(expectedStatus, status);
            Assert.Matches(expectedMessage, message);
        }

        //Test Case 6
        //Login with wrong Username
        [Fact, Order(6)]
        public void Authenticate_LoginWithWrongUsername_CompareStatusAndMessage()
        {
            var request = new UserLoginRequest();
            request.APIKey = "APIKEY";
            request.Username = "WrongUsername";          //Wrong Username
            request.Password = "Password";
            request.Host = "5000";
            var expectedStatus = "False";
            var expectedMessage = "Username or password is incorrect";
            var response = _authAPIController.Login(request);
            var jsonString = JsonConvert.SerializeObject(response.Result);
            JObject obj = JObject.Parse(jsonString);
            BaseResponse baseResponse = JsonConvert.DeserializeObject<BaseResponse>((string)obj.SelectToken("Value"));
            var status = Convert.ToString(baseResponse.Status);
            var message = Convert.ToString(baseResponse.Message);
            Assert.Matches(expectedStatus, status);
            Assert.Matches(expectedMessage, message);
        }

        //Test Case 7
        //Login with wrong Password
        [Fact, Order(7)]
        public void Authenticate_LoginWithWrongPassword_CompareStatusAndMessage()
        {
            var request = new UserLoginRequest();
            request.APIKey = "APIKEY";
            request.Username = "";         //Enter "Receiver's" email address here
            request.Password = "WrongPassword";                     //Wrong Password
            request.Host = "5000";
            var expectedStatus = "False";
            var expectedMessage = "Username or password is incorrect";
            var response = _authAPIController.Login(request);
            var jsonString = JsonConvert.SerializeObject(response.Result);
            JObject obj = JObject.Parse(jsonString);
            BaseResponse baseResponse = JsonConvert.DeserializeObject<BaseResponse>((string)obj.SelectToken("Value"));
            var status = Convert.ToString(baseResponse.Status);
            var message = Convert.ToString(baseResponse.Message);
            Assert.Matches(expectedStatus, status);
            Assert.Matches(expectedMessage, message);
        }

        //Test Case 8 
        [Fact, Order(8)]
        public void ForgotPassword_SendingEmail_CompareStatus()
        {
            var request = new ForgotPasswordRequest();
            var smtp = new Smtp();
            request.Username = "";         //Enter "Receiver's" email address here
            request.APIKey = "APIKEY";
            request.Host = "5000";
            smtp.Host = "smtp.gmail.com";
            smtp.Port = 587;
            smtp.Username = "";          //Enter "Sender's" email address here
            smtp.Password = "";          //Enter "Sender's" password here
            var expectedStatus = "True";
            var response = _authAPIController.ForgotPassword(request);
            var jsonString = JsonConvert.SerializeObject(response.Result);
            JObject obj = JObject.Parse(jsonString);
            BaseResponse baseResponse = JsonConvert.DeserializeObject<BaseResponse>((string)obj.SelectToken("Value"));
            var status = Convert.ToString(baseResponse.Status);
            Assert.Matches(expectedStatus, status);
        }

        //Test Case 9
        [Fact, Order(9)]
        public void ResetPassword_PassingNewPasswordHardcoded_CompareStatus()
        {
            var request = new ModifyPasswordRequest();
            request.Username = "";         //Enter "Receiver's" email address here
            request.NewPassword = "Password";
            request.APIKey = "APIKEY";
            request.Host = "5000";
            var expectedStatus = "True";
            var response = _authAPIController.ResetPassword(request);
            var jsonString = JsonConvert.SerializeObject(response.Result);
            JObject obj = JObject.Parse(jsonString);
            BaseResponse baseResponse = JsonConvert.DeserializeObject<BaseResponse>((string)obj.SelectToken("Value"));
            var status = Convert.ToString(baseResponse.Status);
            Assert.Matches(expectedStatus, status);
        }

        //Test Case 10
        //Compare Old Password And Passing New Password Hardcoded then again change password to old password.
        [Fact, Order(10)]
        public void ChangePassword_CompareOldPasswordAndChangePassword_CompareStatus()
        {
            var request = new ModifyPasswordRequest();
            request.Username = "";         //Enter "Receiver's" email address here
            request.OldPassword = "Password";
            request.NewPassword = "NewPassword";
            request.APIKey = "APIKEY";
            request.Host = "5000";
            var expectedStatus = "True";
            var response = _authAPIController.ChangePassword(request);
            var jsonString = JsonConvert.SerializeObject(response.Result);
            JObject obj = JObject.Parse(jsonString);
            BaseResponse baseResponse = JsonConvert.DeserializeObject<BaseResponse>((string)obj.SelectToken("Value"));
            var status = Convert.ToString(baseResponse.Status);
            request.OldPassword = "NewPassword"; //Resetting old password again
            request.NewPassword = "Password";
            _userService.ChangePassword(request);
            Assert.Matches(expectedStatus, status);
        }
    }
}
