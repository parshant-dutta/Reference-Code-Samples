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
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace DitsPortal.API.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    //[Authorize]
    public class LeavesAPIController : ControllerBase
    {
        #region readonly
        private readonly ILeavesService _LeavesService;
        private readonly JsonSerializerSettings _serializerSettings;
        #endregion

        #region private
        private IOptions<AppSettings> _settings;
        private BaseResponse _response;
        private string _json = string.Empty;
        #endregion

        public LeavesAPIController(ILeavesService leavesService, IOptions<AppSettings> settings)
        {
            _settings = settings;
            _LeavesService = leavesService;
            _serializerSettings = new JsonSerializerSettings
            {
                Formatting = Formatting.Indented,
                NullValueHandling = NullValueHandling.Ignore
            };
            _response = new BaseResponse();
        }
       
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] LeaveRequest leaveRequest)
        {
            try
            {
                SmtpRequest conf = new SmtpRequest();
                conf.Host = _settings.Value.smtp.Host;
                conf.Port = _settings.Value.smtp.Port;
                conf.UserName = _settings.Value.smtp.Username;
                conf.Password = _settings.Value.smtp.Password;
                //leaveRequest.UserId = User.Identity.Name;
                AppSettings settings = new AppSettings();
                string admin = _settings.Value.Admin;
                _response = await _LeavesService.CreateLeave(leaveRequest, conf, admin);

                if (_response.Status == false)
                {
                    _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                    return BadRequest(_json);
                }

                _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                return BadRequest(_json);
            }
        }
        [HttpPost]
        public async Task<ActionResult> GetAllLeaves(LeaveRequestByEmployee filterRequest)
        {
            try
            {
                _response = await _LeavesService.GetAllLeaveRecordByEmployee(filterRequest);
                if (_response.Status == false)
                {
                    _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                    return BadRequest(_json);
                }

                _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                return BadRequest(_json);
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetAllEmployeeLeaves([FromBody] EmployeeLeaveRequestByAdmin employeeLeaveRequestByAdmin)
        {
            try
            {
                _response = await _LeavesService.GetAllLeaveRecordofEmployees(employeeLeaveRequestByAdmin);
                if (_response.Status == false)
                {
                    _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                    return BadRequest(_json);
                }

                _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                return BadRequest(_json);
            }
        }

        [HttpPost]
        public async Task<ActionResult> ApproveRejectLeave (List<ApproveDenyLeave> approveDenyLeaveRequest)
        {
            try
            {
                SmtpRequest conf = new SmtpRequest();
                conf.Host = _settings.Value.smtp.Host;
                conf.Port = _settings.Value.smtp.Port;
                conf.UserName = _settings.Value.smtp.Username;
                conf.Password = _settings.Value.smtp.Password;
                AppSettings settings = new AppSettings();
                string admin = _settings.Value.Admin;

                _response = await _LeavesService.ApproveRejectLeave(approveDenyLeaveRequest, conf, admin);

                if (_response.Status == false)
                {
                    _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                    return BadRequest(_json);
                }

                _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                return BadRequest(_json);
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetLeaves([FromBody] LeaveRequest leaveRequest)
        {
            _response =await _LeavesService.GetLeave(leaveRequest);
            _json = JsonConvert.SerializeObject(_response, _serializerSettings);
            return new OkObjectResult(_json);
        }
        [HttpPost]
        public async Task<ActionResult> UpdateLeaves(LeaveRequest leaveRequest)
        {
            try
            {
                //leaveRequest.UserId = User.Identity.Name;
                _response = await _LeavesService.UpdateLeave(leaveRequest);

                if (_response.Status == false)
                {
                    _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                    return BadRequest(_json);
                }

                _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                return new OkObjectResult(_json);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                _json = JsonConvert.SerializeObject(_response, _serializerSettings);
                return BadRequest(_json);
            }
        }

    }
}