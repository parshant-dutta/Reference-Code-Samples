using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;
using DitsPortal.DataAccess.Data;
using DitsPortal.DataAccess.DBEntities;
using DitsPortal.DataAccess.IRepositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DitsPortal.DataAccess.Repositories
{
    public class GlobalCodesRepository : BaseRepository<GlobalCodes>, IGlobalCodesRepository
    {

        ApplicationDBContext ObjContext;
        public GlobalCodesRepository(ApplicationDBContext context) : base(context)
        {
            ObjContext = context;
           
        }
        public async Task<GlobalCodeMainResponse> GetAllGlobalCodeRecords(LeaveRequest leaveRequest)
        {
            IQueryable<GlobalCodeResponse> data;
            double balance;
            GlobalCodeMainResponse globalCodeMainResponse = new GlobalCodeMainResponse();
            data = from g1 in ObjContext.GlobalCodes
                   where g1.IsDeleted == false && g1.IsActive == true 
                   select new GlobalCodeResponse
                   {
                       GlobalCodeCategoryId = g1.GlobalCodeCategoryId,
                       GlobalCodeId = g1.GlobalCodeId,
                       CodeName = (g1.CodeName == null ? "" : g1.CodeName),
                       IsActive = g1.IsActive,
                       Description = (g1.Description == null ? String.Empty : g1.Description)
                   };
            balance = await (from s in ObjContext.LeavesBalance where s.EmployeeId == leaveRequest.EmployeeId select s.Balance).FirstOrDefaultAsync();
            globalCodeMainResponse.balance = balance;
            globalCodeMainResponse.totalRecords = data.Count();
            globalCodeMainResponse.globalCodeResponse = await data.ToListAsync();
            return globalCodeMainResponse;
        }

        public async Task<GlobalCodeMainResponse> GetGlobalCodeByCategoryName(GlobalCodeCategoryRequest categoryNameRequest)
        {
            GlobalCodeMainResponse globalCodeMainResponse = new GlobalCodeMainResponse();
            List<GlobalCodeResponse> data;
            data = await (from gc in ObjContext.GlobalCodes
                    join gcc in ObjContext.GlobalCodeCategories on categoryNameRequest.Name equals gcc.CategoryName
                    where gc.IsDeleted == false && gc.IsActive
                    && gcc.IsActive && gcc.IsDeleted == false && gcc.GlobalCodeCategoryId==gc.GlobalCodeCategoryId
                          select new GlobalCodeResponse
                    {
                        CategoryName = gcc.CategoryName,
                        GlobalCodeId = gc.GlobalCodeId,
                        GlobalCodeCategoryId = gcc.GlobalCodeCategoryId,
                        Description = gc.Description,
                        CodeName = gc.CodeName,
                        IsActive=gc.IsActive
                    }).ToListAsync();
            globalCodeMainResponse.totalRecords = data.Count();
            globalCodeMainResponse.globalCodeResponse =data;
            return globalCodeMainResponse;
        }

        public async Task<GlobalNameResponse> GetGlobalName(LeaveRequest leaveRequest)
        {
            var leaveType = await(from s in ObjContext.GlobalCodes where s.GlobalCodeId == leaveRequest.LeaveType select s.CodeName).FirstOrDefaultAsync();
            var leaveDuration = await(from s in ObjContext.GlobalCodes where s.GlobalCodeId == leaveRequest.Duration select s.CodeName).FirstOrDefaultAsync();
            GlobalNameResponse globalNameResponse = new GlobalNameResponse();
            globalNameResponse.LeaveType = leaveType;
            globalNameResponse.DurationType = leaveDuration;
            return globalNameResponse;
            //throw new NotImplementedException();
        }
    }
}
