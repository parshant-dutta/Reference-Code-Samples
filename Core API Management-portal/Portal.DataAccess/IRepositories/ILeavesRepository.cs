using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;
using DitsPortal.DataAccess.DBEntities.Base;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DitsPortal.DataAccess.IRepositories
{
    public interface ILeavesRepository : IBaseRepository<Leaves>
    {
        Task<LeaveMainResponse> GetAllLeaveRecordByEmployee(LeaveRequestByEmployee leaveRequest);
        Task<string> GetUserById(int userId);
        Task<BaseResponse> ApproveRejectLeave(List<ApproveDenyLeave> approveDenyLeaveRequest, SmtpRequest smtpRequest,string admin);
        Task<int> GetGlobalCode(string codeName);
        Task<LeaveResponse> GetLeaveRecord(Leaves LeaveType);
        Task<LeaveMainResponse> GetLeave(LeaveRequest leaveRequest);
        Task<BaseResponse> UpdateLeave(LeaveRequest leaveRequest);
        Task<LeaveMainResponse> GetAllLeaveRecordofEmployees(EmployeeLeaveRequestByAdmin employeeLeaveRequestByAdmin);


    }
}
