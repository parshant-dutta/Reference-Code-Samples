using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;

namespace DitsPortal.Services.IServices
{
    public interface IGlobalCodesService
    {
        Task<BaseResponse> GetAllGlobalCodeRecords(LeaveRequest leaveRequest);
        Task<BaseResponse> GetGlobalCodeByCategoryName(GlobalCodeCategoryRequest globalCodeCategoryRequest);
    }

}
