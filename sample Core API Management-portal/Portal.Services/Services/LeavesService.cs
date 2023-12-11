using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;
using DitsPortal.Common.StaticResources;
using DitsPortal.DataAccess;
using DitsPortal.DataAccess.DBEntities.Base;
using DitsPortal.DataAccess.IRepositories;
using DitsPortal.DataAccess.Migrations;
using DitsPortal.Services.IServices;
using Microsoft.Extensions.Logging;

namespace DitsPortal.Services.Services
{
    public class LeavesService : ILeavesService
    {
        #region readonly
        private readonly ILeavesRepository _leavesRepository;
        private readonly IGlobalCodesRepository _globalCodesRepository;
        private readonly IMapper _mapper;
        #endregion

        #region Object Variables
        private MainResponse _response;
        private ILogger<LeavesService> _logger;
        private UploadImage _uploadImage;
        #endregion

        public LeavesService(ILeavesRepository leavesRepository,IGlobalCodesRepository globalCodesRepository, IMapper mapper,ILogger<LeavesService> logger)
        {
            _leavesRepository = leavesRepository;
            _globalCodesRepository = globalCodesRepository;
            _mapper = mapper;
            _logger = logger;
            _response = new MainResponse();
            _uploadImage = new UploadImage();
            _response.Status = false;
        }
        public async Task<BaseResponse> CreateLeave(LeaveRequest leaveRequest, SmtpRequest smtpRequest,string admin)
        {
            try
            {
                var getPendingId = (_globalCodesRepository.GetSingle(x => x.CodeName == "Pending").GlobalCodeId);
                var CreateLeave = _mapper.Map<Leaves>(leaveRequest);
                CreateLeave.EmployeeId = leaveRequest.EmployeeId;
                CreateLeave.LeaveType = leaveRequest.LeaveType;
                CreateLeave.StartDate = leaveRequest.StartDate;
                CreateLeave.EndDate = leaveRequest.EndDate;
                CreateLeave.Reason = leaveRequest.Reason;
                CreateLeave.NumberOfDays = leaveRequest.NumberOfDays;
                CreateLeave.IsActive = true;
                CreateLeave.CreatedOn = DateTime.Now;
                CreateLeave.AppliedDate = DateTime.Now;
                CreateLeave.RequestStatus = getPendingId;

                var data =  _leavesRepository.Add(CreateLeave);

                if (data != null)
                {
                    var leaveTypeName = await _leavesRepository.GetLeaveRecord(data);
                    bool SendEmail = NotificationHelper.SendLeaveRequestEmail(leaveTypeName, smtpRequest, admin);
                    _response.Status = true;
                    _response.Message = SendEmail? Constants.LEAVE_CREATED :Constants.EMAIL_ERROR;
                }
                else
                {
                    _response.Message = Constants.LEAVE_NOT_CREATED;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                _response.Status = false;
                _response.Message = Constants.DEFAULT_ERROR_MSG;
            }
            return _response;
        }
        public async Task<BaseResponse> GetAllLeaveRecordByEmployee(LeaveRequestByEmployee filterRequest)
        {
            try
            {
                var leaveResponse = await _leavesRepository.GetAllLeaveRecordByEmployee(filterRequest);
                if (leaveResponse.totalRecords != 0)
                {
                    _response.Status = true;
                    _response.Message = Constants.DEFAULT_SUCCESS_MSG;
                    _response.data.leaveMainResponse = leaveResponse;
                }
                else
                {
                    _response.Message = Constants.GLOBAL_CODE_CATEGORY_NOT_EXISTS;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return _response;
        }

        public async Task<BaseResponse> GetAllLeaveRecordofEmployees(EmployeeLeaveRequestByAdmin employeeLeaveRequestByAdmin)
        {
            try
            {
                var leaveResponse = await _leavesRepository.GetAllLeaveRecordofEmployees(employeeLeaveRequestByAdmin);
                if (leaveResponse.totalRecords != 0)
                {

                    _response.Status = true;
                    _response.Message = Constants.DEFAULT_SUCCESS_MSG;
                    _response.data.leaveMainResponse = leaveResponse;
                }
                else
                {
                    _response.Message = Constants.NO_LEAVE_AVAILABLE;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                _response.Status = false;
                _response.Message = Constants.DEFAULT_ERROR_MSG;
            }
            return _response;
        }
        public async Task<BaseResponse> ApproveRejectLeave(List<ApproveDenyLeave> approveDenyLeaveRequest, SmtpRequest smtpRequest, string admin)
        {
            return await _leavesRepository.ApproveRejectLeave(approveDenyLeaveRequest,smtpRequest, admin);
        }

        public async Task<BaseResponse> GetLeave(LeaveRequest leaveRequest)
        {
            try {
                var leaveResponse = await _leavesRepository.GetLeave(leaveRequest);
                _response.data.leaveMainResponse = leaveResponse;
                _response.Status = true;
                _response.Message = Constants.DEFAULT_SUCCESS_MSG;
                _response.data.leaveMainResponse = leaveResponse;
                return _response;
            }
            catch {
                throw new NotImplementedException();
            }

        }
        public async Task<BaseResponse> UpdateLeave(LeaveRequest leaveRequest)
        {
            try
            {
                //var leaves = _mapper.Map<leaves>(leaveRequest);
                var isExist = _leavesRepository.Get<Leaves>(leaveRequest.LeaveId);
                if (isExist != null)
                {
                    isExist.LeaveType = leaveRequest.LeaveType;
                    isExist.ModifiedOn = DateTime.Now;
                    isExist.Duration = leaveRequest.Duration;
                    isExist.NumberOfDays = leaveRequest.NumberOfDays;
                    isExist.StartDate = leaveRequest.StartDate;
                    isExist.EndDate = leaveRequest.EndDate;
                    isExist.Reason = leaveRequest.Reason;
                    isExist.PendingLeaves = leaveRequest.PendingLeaves;
                    _leavesRepository.Update(isExist);

                    _response.Message = Constants.LEAVE_UPDATE;
                    _response.Status = true;
                    return _response;

                }


                //var data = _leavesRepository.UpdateLeave(leaveRequest);
                //if (data.Result.Status == true)
                //{
                //    _response.Message = Constants.LEAVE_UPDATE;
                //    _response.Status = true;
                //}
                else
                {
                    _response.Status = false;
                    _response.Message = Constants.LEAVE_NOT_UPDATE;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return _response;
        }

    }
}

