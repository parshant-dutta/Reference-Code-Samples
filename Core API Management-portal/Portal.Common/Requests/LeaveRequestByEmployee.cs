using System;
using System.Collections.Generic;
using System.Text;

namespace DitsPortal.Common.Requests
{
    public class LeaveRequestByEmployee: BaseRecordFilterRequest
    {
        public int EmployeeId { get; set; }
    }
}
