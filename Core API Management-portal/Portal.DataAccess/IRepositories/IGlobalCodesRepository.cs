using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;
using DitsPortal.DataAccess.DBEntities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DitsPortal.DataAccess.IRepositories
{
    public interface IGlobalCodesRepository : IBaseRepository<GlobalCodes>
    {
        Task<GlobalCodeMainResponse> GetAllGlobalCodeRecords(LeaveRequest leaveRequest);
        Task<GlobalNameResponse> GetGlobalName(LeaveRequest leaveRequest);
        Task<GlobalCodeMainResponse> GetGlobalCodeByCategoryName(GlobalCodeCategoryRequest globalCodeCategoryRequest);
    }
}
