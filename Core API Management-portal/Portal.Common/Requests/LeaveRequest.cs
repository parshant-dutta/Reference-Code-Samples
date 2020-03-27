using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using DitsPortal.Common.StaticResources;

namespace DitsPortal.Common.Requests
{
    public class LeaveRequest : EmployeeLeaveRequest
    {
        public int LeaveType { get; set; }
        public int LeaveId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Double NumberOfDays { get; set; }
        public string Reason { get; set; }
        public int PendingLeaves { get; set; }
        public int Duration { get; set; }
        //public string Comment { get; set; }
    }

   
    //public class ApproveDenyLeaveRequest
    //{
    //    public List<ApproveDenyLeave> approveDenyLeaveList { get; set; }
    //}

    public class ApproveDenyLeave
    {
        public int EmployeeId { get; set; }
        public Double NumberOfDays { get; set; }
        public int LeaveId { get; set; }
        public bool IsApproved { get; set; }
        public string RejectionReason { get; set; }
    }
    public class EmployeeLeaveRequest
    {
        public int EmployeeId { get; set; }
    }
    public class EmployeeLeaveRequestByAdmin : BaseRecordFilterRequest
    {
        public bool PendingLeaves { get; set; }
        public bool ApprovedLeaves { get;set;}
    }
    public class PendingLeaveRequest
    {
        public int UserId { get; set; }
    }

}
