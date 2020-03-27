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
    [Authorize]
    public class GlobalCodesAPIController : ControllerBase
    {
        #region readonly
        private readonly IGlobalCodesService _globalCodesService;
        private readonly JsonSerializerSettings _serializerSettings;

        #endregion

        #region private
        private IOptions<AppSettings> _settings;
        private BaseResponse _response;
        private string _json = string.Empty;
        #endregion

        public GlobalCodesAPIController(IGlobalCodesService globalCodesService, IOptions<AppSettings> settings)
        {
            _settings = settings;
            _globalCodesService = globalCodesService;
            _serializerSettings = new JsonSerializerSettings
            {
                Formatting = Formatting.Indented,
                NullValueHandling = NullValueHandling.Ignore
            };

            _response = new BaseResponse();
        }


        
        [HttpPost]
        public async Task<ActionResult> GetAllGlobalCodeRecords([FromBody] LeaveRequest leaveRequest)
        {
            try
            {
                _response = await _globalCodesService.GetAllGlobalCodeRecords(leaveRequest);
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
        public async Task<ActionResult> GetGlobalCodeByCategoryName([FromBody] GlobalCodeCategoryRequest globalCodeRequest)
        {
            try
            {
                _response = await _globalCodesService.GetGlobalCodeByCategoryName(globalCodeRequest);
                if (_response.Status == false)
                {
                    return new OkObjectResult(_response);
                }
                return new OkObjectResult(_response);

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