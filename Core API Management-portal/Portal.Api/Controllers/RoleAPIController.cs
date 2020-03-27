using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;
using DitsPortal.DataAccess.DBEntities.Base;
using DitsPortal.Services.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DitsPortal.API.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class RoleAPIController : ControllerBase
    {
        private readonly IMapper _mapper;
        private string _json = string.Empty;

        #region constructor
        private readonly IRoleServcie _roleServcie;
        private MainRoleResponse _response;

        #endregion

        #region constructor
        public RoleAPIController(IRoleServcie roleServcie, IMapper mapper)
        {
            _mapper = mapper;
            _roleServcie = roleServcie;
        }
        #endregion
        [HttpPost]
        public async Task<ActionResult> AddRole([FromBody]RoleRequest roleRequest)
        {
            try
            {
                 _response =await _roleServcie.AddRole(roleRequest);
                return new OkObjectResult(_response);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                return BadRequest("");
            }
        }
        [HttpPost]
        public async Task<ActionResult> UpdateRole([FromBody]RoleRequest roleRequest)
        {
            try
            {
                _response = await _roleServcie.UpdateRole(roleRequest);
                return new OkObjectResult(_response);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                return BadRequest("");
            }
        }
        [HttpPost]
        public async Task<ActionResult> DeleteRole([FromBody]RoleDeleteRequest roleDeleteRequest)
        {
            try
            {
                _response = await _roleServcie.DeleteRole(roleDeleteRequest);
                return new OkObjectResult(_response);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                return BadRequest(_response);
            }
        }
        [HttpPost]
        public async Task<ActionResult> GetRoleById([FromBody]RoleByIdRequest roleByIdRequest)
        {
            try
            {
                _response = await _roleServcie.RoleGetById(roleByIdRequest.RoleId);
                return new OkObjectResult(_response);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                return BadRequest(_response);
            }
        }
        [HttpPost]
        public async Task<ActionResult> GetAllRoles(RecordFilterRequest recordFilterRequest)
        {
            try
            {
                _response = await _roleServcie.GetAllRoles(recordFilterRequest);
                return new OkObjectResult(_response);
            }
            catch (Exception ex)
            {
                _response.Message = ex.Message;
                _response.Status = false;
                return BadRequest(_response);
            }
        }
    }
}