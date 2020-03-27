using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;

namespace DitsPortal.Services.IServices
{
    public interface ILeavesService
    {
        Task<BaseResponse> CreateLeave(LeaveRequest leaveRequest, SmtpRequest smtpRequest, string admin);
        Task<BaseResponse> GetAllLeaveRecordByEmployee(LeaveRequestByEmployee filterRequest);
        Task<BaseResponse> ApproveRejectLeave(List<ApproveDenyLeave> approveDenyLeaveRequest, SmtpRequest smtpRequest, string admin);
        Task<BaseResponse> UpdateLeave(LeaveRequest leaveRequest);
        Task<BaseResponse> GetLeave(LeaveRequest leaveRequest);
        Task<BaseResponse> GetAllLeaveRecordofEmployees(EmployeeLeaveRequestByAdmin employeeLeaveRequestByAdmin);
        //Task<BaseResponse> GetAllPendingLeaves(EmployeeLeaveRequest employeeleaveRequest);

    }

}
