using System;
using System.Collections.Generic;
using System.Text;

namespace DitsPortal.Common.Responses
{
    public class LeaveMainResponse:BaseResponse
    {
        public List<LeaveResponse> leaveResponse { get; set; }
        public List<LeaveTypeResponse> leaveTypeResponse { get; set; }
        public List<DurationResponse> durationResponse { get; set; }
        public List<ResponseMonthlyCount> monthlyCount { get; set; }
        public int totalRecords { get; set; }
        public Double monthlyBalance { get; set; }
        public Double availedLeaves { get; set; }
        public Double balance { get; set; }
    }
    public class LeaveResponse
    {
        public int EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int LeaveId { get; set; }
        public string LeaveType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        public Double NumberOfDays { get; set; }
    
        public int PendingLeaves { get; set; }
        
        public string Reason { get; set; }
        
        public DateTime? AppliedDate { get; set; }
        
        public int RequestStatus { get; set; }
        public string RequestStatusName { get; set; }
        
        public DateTime? RejectionDate { get; set; }
        
        public string RejectionReason { get; set; }
        
        public string RejectedBy { get; set; }
        
        public string FromSession { get; set; }
        
        public string ToSession { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Duration { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedOn { get; set; }

    }
    public class LeaveTypeResponse
    {
        public string LeaveType { get; set; }
        public int Count { get; set; }
    }
    public class DurationResponse
    {
        public string DurationType { get; set; }
        public int Count { get; set; }
    }
    public class ResponseMonthlyCount
    {
        public int MonthName { get; set; }
        public Double TotalLeaves { get; set; }
    }
}

