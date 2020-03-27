using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;
using DitsPortal.Common.StaticResources;
using DitsPortal.DataAccess.Data;
using DitsPortal.DataAccess.DBEntities.Base;
using DitsPortal.DataAccess.IRepositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DitsPortal.DataAccess.Repositories
{
    public class LeavesRepository : BaseRepository<Leaves>, ILeavesRepository

    {
        //private readonly ApplicationDBContext ObjContext;
        //public LeavesRepository( ApplicationDBContext _ObjContext)
        //{
        //    this.ObjContext = _ObjContext;
        //}
        ApplicationDBContext ObjContext;
        private ILeavesRepository _leavesRepository;
        private MainResponse _response;
        private BaseResponse _baseResponse;
        private readonly IMapper _mapper;
        private ILogger<LeavesRepository> _logger;
        public LeavesRepository(ApplicationDBContext context, ILogger<LeavesRepository> logger) : base(context)
        {
            ObjContext = context;
            _logger = logger;
        }
        public async Task<LeaveMainResponse> GetAllLeaveRecordByEmployee(LeaveRequestByEmployee FilterRequest)
        {
            FilterRequest.Page = FilterRequest.Page == 0 ? 1 : FilterRequest.Page;
            FilterRequest.Limit = FilterRequest.Limit == 0 ? 10 : FilterRequest.Limit;
            IQueryable<LeaveResponse> data;
            LeaveMainResponse leaveMainResponse = new LeaveMainResponse();
            data = from l1 in ObjContext.Leave
                   join GC1 in ObjContext.GlobalCodes on l1.LeaveType equals GC1.GlobalCodeId into gcode1
                   from gcd1 in gcode1.DefaultIfEmpty()
                   join GC2 in ObjContext.GlobalCodes on l1.RequestStatus equals GC2.GlobalCodeId into gcode2
                   from gcd2 in gcode2.DefaultIfEmpty()
                   join GC3 in ObjContext.GlobalCodes on l1.Duration equals GC3.GlobalCodeId into gcode3
                   from gcd3 in gcode3.DefaultIfEmpty()
                   join U in ObjContext.Users on l1.EmployeeId equals U.UserId into US1
                   from US in US1.DefaultIfEmpty()
                   orderby FilterRequest.OrderBy
                   where l1.IsDeleted == false && l1.IsActive == true && l1.EmployeeId == FilterRequest.EmployeeId
                   select new LeaveResponse
                   {
                       EmployeeId = l1.EmployeeId,
                       LeaveType = gcd1.CodeName,
                       Duration = (gcd3.CodeName == null ? String.Empty : gcd3.CodeName),
                       StartDate = l1.StartDate,
                       EndDate = l1.EndDate,
                       NumberOfDays = l1.NumberOfDays,
                       CreatedOn = l1.CreatedOn,
                       LeaveId = l1.LeaveId,
                       Reason = l1.Reason,
                       RequestStatusName = (gcd2.CodeName == null ? String.Empty : gcd2.CodeName),
                       PendingLeaves = l1.PendingLeaves,
                       RequestStatus = l1.RequestStatus,
                       Username = US.UserName,
                       Email = US.Email
                   };

            if (FilterRequest.OrderByDescending == true)
            {
                data = data.OrderByDescending(x => x.GetType().GetProperty(FilterRequest.OrderBy).GetValue(x));
            }
            else
            {
                data = data.OrderBy(x => x.GetType().GetProperty(FilterRequest.OrderBy).GetValue(x));
            }
            leaveMainResponse.totalRecords = data.Count();
            if (FilterRequest.AllRecords)
            {
                leaveMainResponse.leaveResponse = await data.ToListAsync();
            }
            else
            {
                leaveMainResponse.leaveResponse = data.Skip((FilterRequest.Page - 1) * FilterRequest.Limit).Take(FilterRequest.Limit).ToList();
            }

            return leaveMainResponse;
        }
        public async Task<LeaveMainResponse> GetAllLeaveRecordofEmployees(EmployeeLeaveRequestByAdmin employeeLeaveRequestByAdmin)
        {
            IQueryable<LeaveResponse> data;
            IQueryable<LeaveTypeResponse> count;
            IQueryable<DurationResponse> durationcount;
            LeaveMainResponse leaveMainResponse = new LeaveMainResponse();
            Double monthlyBalance = 0;
            Double availedLeaves = 0;
            Double balance = 0;
            
            data = from l1 in ObjContext.Leave
                   join GC1 in ObjContext.GlobalCodes on l1.LeaveType equals GC1.GlobalCodeId into gcode1
                   from gcd1 in gcode1.DefaultIfEmpty()
                   join GC2 in ObjContext.GlobalCodes on l1.RequestStatus equals GC2.GlobalCodeId into gcode2
                   from gcd2 in gcode2.DefaultIfEmpty()
                   join GC3 in ObjContext.GlobalCodes on l1.Duration equals GC3.GlobalCodeId into gcode3
                   from gcd3 in gcode3.DefaultIfEmpty()
                   join GC4 in ObjContext.GlobalCodes on l1.RequestStatus equals GC4.GlobalCodeId into gcode4
                   from gcd4 in gcode4.DefaultIfEmpty()
                   join U in ObjContext.Users on l1.EmployeeId equals U.UserId into US1
                   from US in US1.DefaultIfEmpty()
                   where l1.IsDeleted == false && l1.IsActive == true                   
                   //&& gcd4.CodeName == "Pending"
                   //&& (l1.EmployeeId == leaveRequest.EmployeeId)                 
                   select new LeaveResponse
                   {
                       EmployeeId = l1.EmployeeId,
                       LeaveType = gcd1.CodeName,
                       StartDate = l1.StartDate,
                       Duration = gcd3.CodeName,
                       EndDate = l1.EndDate,
                       NumberOfDays = l1.NumberOfDays,
                       RequestStatus = l1.RequestStatus,
                       PendingLeaves = l1.PendingLeaves,
                       Username = US.UserName,
                       Reason = l1.Reason,
                       LeaveId = l1.LeaveId,
                       Email = US.Email,
                       Status = gcd4.CodeName
                   };

          
            int approved = await GetGlobalCode("Approved");
            int pending = await GetGlobalCode("Pending");

            if (data != null)
            {

                var monthlyJobCount = from leave in ObjContext.Leave
                                      where leave.CreatedOn.Month <= DateTime.Now.Month &&
                                      leave.CreatedOn.Year == DateTime.Now.Year &&
                                      // leave.EmployeeId == leaveRequest.EmployeeId &&
                                      leave.RequestStatus == approved
                                      group leave by leave.CreatedOn.Month into g
                                      select new ResponseMonthlyCount
                                      {
                                          MonthName = g.First().CreatedOn.Month,
                                          TotalLeaves = g.Sum(pc => pc.NumberOfDays),
                                      };
                foreach (var leave in monthlyJobCount)
                {
                    monthlyBalance = 1.5 + balance;
                    availedLeaves = leave.TotalLeaves;
                    balance = monthlyBalance - availedLeaves;
                }
                if (employeeLeaveRequestByAdmin.OrderByDescending == true)
                {
                    data = data.OrderByDescending(x => x.GetType().GetProperty(employeeLeaveRequestByAdmin.OrderBy).GetValue(x));
                }
                else
                {
                    data = data.OrderBy(x => x.GetType().GetProperty(employeeLeaveRequestByAdmin.OrderBy).GetValue(x));
                }
                if (employeeLeaveRequestByAdmin.AllRecords)
                {
                    leaveMainResponse.leaveResponse = data.ToList();
                }
                else
                {
                    leaveMainResponse.leaveResponse = data.Skip((employeeLeaveRequestByAdmin.Page - 1) * employeeLeaveRequestByAdmin.Limit).Take(employeeLeaveRequestByAdmin.Limit).ToList();
                }
                if (employeeLeaveRequestByAdmin.PendingLeaves==true)
                {
                    data = data.Where(l => l.RequestStatus == pending);
                }
                if (employeeLeaveRequestByAdmin.ApprovedLeaves==true)
                {
                    data = data.Where(x => x.RequestStatus == approved);
                }

                leaveMainResponse.leaveResponse = await data.ToListAsync();
                leaveMainResponse.totalRecords = data.Count();

                data = data.Where(x => x.RequestStatus == approved);
                count = data.GroupBy(x => new { x.LeaveType }).Select(g => new LeaveTypeResponse { LeaveType = g.FirstOrDefault().LeaveType, Count = g.Count() });
                durationcount = data.GroupBy(x => new { x.Duration }).Select(g => new DurationResponse { DurationType = g.FirstOrDefault().Duration, Count = g.Count() });
                leaveMainResponse.Status = true;
                leaveMainResponse.monthlyBalance = monthlyBalance;
                leaveMainResponse.availedLeaves = availedLeaves;
                leaveMainResponse.balance = balance;
                leaveMainResponse.leaveTypeResponse = await count.ToListAsync();
                leaveMainResponse.durationResponse = await durationcount.ToListAsync();
            }
            return leaveMainResponse;
        }
        public async Task<string> GetUserById(int userId)
        {
            string email = string.Empty;
            var data = await (from s in ObjContext.Users where s.UserId == userId select s.Email).FirstOrDefaultAsync();
            email = data;
            return email;
        }
        public async Task<BaseResponse> ApproveRejectLeave(List<ApproveDenyLeave> approveDenyLeaveRequest, SmtpRequest smtpRequest, string admin)
        {
            _baseResponse = new BaseResponse();
            int approved = await GetGlobalCode("Approved");
            int rejected = await GetGlobalCode("Declined");

            try
            {
                if (approveDenyLeaveRequest.Count > 0)
                {
                    foreach (var leave in approveDenyLeaveRequest)
                    {

                        var leaves = ObjContext.Leave.Where(x => x.LeaveId == leave.LeaveId).FirstOrDefault();
                        if (leave.IsApproved == true)
                        {
                            var data = ObjContext.LeavesBalance.Where(x => x.EmployeeId == leave.EmployeeId).FirstOrDefault();

                            if (data != null)
                            {
                                var balance = data.Balance;
                                var availed = data.Availed;
                                data.ModifiedOn = DateTime.Now;
                                data.ModifiedBy = "admin";
                                data.Balance = balance - leave.NumberOfDays;
                                data.Availed = availed + leave.NumberOfDays;
                            }
                            //update leaves table
                            leaves.RequestStatus = approved;
                            _baseResponse.Message = Constants.LEAVE_APPROVED;

                        }
                        else
                        {
                            leaves.RequestStatus = rejected;
                            leaves.RejectedBy = "Admin";
                            leaves.RejectionDate = DateTime.Now;
                            leaves.RejectionReason = leave.RejectionReason;
                            _baseResponse.Message = Constants.LEAVE_NOT_APPROVED;
                        }
                        leaves.ModifiedBy = "Admin";
                        leaves.ModifiedOn = DateTime.Now;
                        await ObjContext.SaveChangesAsync();
                        string userEmail = await GetUserById(leave.EmployeeId);
                        var leaveData = ObjContext.Leave.Where(x=> x.LeaveId==leaves.LeaveId).FirstOrDefault();
                        bool sendEmail = NotificationHelper.SendLeaveStatusEmail(userEmail, smtpRequest, leave.IsApproved, admin);
                        _baseResponse.Status = true;
                    }
                }

            }

            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                _baseResponse.Status = false;
                _baseResponse.Message = Constants.LEAVE_NOT_APPROVED;
            }


            return _baseResponse;
        }
        public async Task<int> GetGlobalCode(string codeName)
        {
            int id = 0;
            int data = await (from s in ObjContext.GlobalCodes where s.CodeName == codeName select s.GlobalCodeId).FirstOrDefaultAsync();
            id = data;
            return data;
        }
        public async Task<LeaveMainResponse> GetLeave(LeaveRequest leaveRequest)
        {
            IQueryable<LeaveResponse> data;
            IQueryable<LeaveTypeResponse> count;
            IQueryable<DurationResponse> durationcount;
            LeaveMainResponse leaveMainResponse = new LeaveMainResponse();
            Double monthlyBalance = 0;
            Double availedLeaves = 0;
            Double balance = 0;

            data = from l1 in ObjContext.Leave
                   join GC1 in ObjContext.GlobalCodes on l1.LeaveType equals GC1.GlobalCodeId into gcode1
                   from gcd1 in gcode1.DefaultIfEmpty()
                   join GC2 in ObjContext.GlobalCodes on l1.RequestStatus equals GC2.GlobalCodeId into gcode2
                   from gcd2 in gcode2.DefaultIfEmpty()
                   join GC3 in ObjContext.GlobalCodes on l1.Duration equals GC3.GlobalCodeId into gcode3
                   from gcd3 in gcode3.DefaultIfEmpty()
                   join GC4 in ObjContext.GlobalCodes on l1.RequestStatus equals GC4.GlobalCodeId into gcode4
                   from gcd4 in gcode4.DefaultIfEmpty()
                   join U in ObjContext.Users on l1.EmployeeId equals U.UserId into US1
                   from US in US1.DefaultIfEmpty()
                   where l1.IsDeleted == false && l1.CreatedOn.Year == DateTime.Now.Year && l1.IsActive == true && (l1.EmployeeId == leaveRequest.EmployeeId)
                   select new LeaveResponse
                   {
                       EmployeeId = l1.EmployeeId,
                       LeaveType = gcd1.CodeName,
                       StartDate = l1.StartDate,
                       Duration = gcd3.CodeName,
                       EndDate = l1.EndDate,
                       NumberOfDays = l1.NumberOfDays,
                       RequestStatus = l1.RequestStatus,
                       PendingLeaves = l1.PendingLeaves,
                       Username = US.UserName,
                       Reason = l1.Reason,
                       LeaveId = l1.LeaveId,
                       Email = US.Email,
                       Status = gcd4.CodeName
                   };
            int approved = await GetGlobalCode("Approved");

            if (data != null)
            {

                var monthlyJobCount = from leave in ObjContext.Leave
                                      where leave.CreatedOn.Month <= DateTime.Now.Month &&
                                      leave.CreatedOn.Year == DateTime.Now.Year &&
                                      leave.EmployeeId == leaveRequest.EmployeeId &&
                                      leave.RequestStatus == approved
                                      group leave by leave.CreatedOn.Month into g
                                      select new ResponseMonthlyCount
                                      {
                                          MonthName = g.First().CreatedOn.Month,
                                          TotalLeaves = g.Sum(pc => pc.NumberOfDays),
                                      };


                foreach (var leave in monthlyJobCount)
                {
                    monthlyBalance = balance + 1.5;
                    availedLeaves = leave.TotalLeaves;
                    balance = monthlyBalance - availedLeaves;
                }

                if (monthlyJobCount.Count() < DateTime.Now.Month)
                {
                    monthlyBalance = balance + 1.5;
                }

                leaveMainResponse.leaveResponse = await data.ToListAsync();
                leaveMainResponse.totalRecords = data.Count();

                data = data.Where(x => x.RequestStatus == approved);
                count = data.GroupBy(x => new { x.LeaveType }).Select(g => new LeaveTypeResponse { LeaveType = g.FirstOrDefault().LeaveType, Count = g.Count() });
                durationcount = data.GroupBy(x => new { x.Duration }).Select(g => new DurationResponse { DurationType = g.FirstOrDefault().Duration, Count = g.Count() });
                leaveMainResponse.Status = true;
                leaveMainResponse.monthlyBalance = monthlyBalance;
                leaveMainResponse.availedLeaves = availedLeaves;
                leaveMainResponse.balance = balance;
                leaveMainResponse.leaveTypeResponse = await count.ToListAsync();
                leaveMainResponse.durationResponse = await durationcount.ToListAsync();
            }
            return leaveMainResponse;

        }
        public async Task<BaseResponse> UpdateLeave(LeaveRequest leaveRequest)
        {
            BaseResponse baseResponse = new BaseResponse();
            var leaves = _mapper.Map<Leaves>(leaveRequest);
            var getdata = ObjContext.Leave.Update(leaves);
            ObjContext.SaveChanges();

            var Data = (from leave in ObjContext.Leave where leave.LeaveId == leaveRequest.LeaveId && leave.IsDeleted == false select leave);
            if (Data != null)
            {
                foreach (var item in Data)
                {
                    item.LeaveType = leaveRequest.LeaveType;
                    item.StartDate = leaveRequest.StartDate;
                    item.EndDate = leaveRequest.EndDate;
                    item.Reason = leaveRequest.Reason;
                    item.NumberOfDays = leaveRequest.NumberOfDays;
                    item.ModifiedOn = DateTime.Now;
                }
                var updateData = ObjContext.SaveChanges();
                baseResponse.Status = true;
            }
            return baseResponse;
            //return await Task.FromResult(baseResponse);

        }

        //Task<LeaveMainResponse> ILeavesRepository.GetAllLeaveRecordofEmployees(EmployeeLeaveRequest employeeleaveRequest)
        //{
        //    throw new NotImplementedException();
        //}

        async Task<string> ILeavesRepository.GetUserById(int userId)
        {
            string email = string.Empty;
            var data = await (from s in ObjContext.Users where s.UserId == userId select s.Email).FirstOrDefaultAsync();
            email = data;
            return email;
        }



        Task<int> ILeavesRepository.GetGlobalCode(string codeName)
        {
            throw new NotImplementedException();
        }

        Task<LeaveMainResponse> ILeavesRepository.GetLeave(LeaveRequest leaveRequest)
        {
            throw new NotImplementedException();
        }
        
        public async Task<LeaveResponse> GetLeaveRecord(Leaves LeaveType)
        {

            var leaveResponse = await (from s in ObjContext.Leave
                                       join gc1 in ObjContext.GlobalCodes on s.LeaveType equals gc1.GlobalCodeId
                                       join user in ObjContext.Users on s.EmployeeId equals user.UserId
                                       join gc2 in ObjContext.GlobalCodes on s.Duration equals gc2.GlobalCodeId
                                       where s.LeaveId == LeaveType.LeaveId
                                       select new LeaveResponse
                                       {
                                           EmployeeId = s.EmployeeId,
                                           LeaveId = s.LeaveId,
                                           StartDate = s.StartDate,
                                           EndDate = s.EndDate,
                                           NumberOfDays = s.NumberOfDays,
                                           PendingLeaves = s.PendingLeaves,
                                           Reason = s.Reason,
                                           AppliedDate = s.AppliedDate,
                                           RequestStatus = s.RequestStatus,
                                           RejectionDate = s.RejectionDate,
                                           RejectionReason = s.RejectionReason,
                                           RejectedBy = s.RejectedBy,
                                           FromSession = s.FromSession,
                                           ToSession = s.ToSession,
                                           Username = user.UserName,
                                           Email = user.Email,
                                           FirstName = user.FirstName,
                                           LastName = user.LastName,
                                           LeaveType = gc1.Description,
                                           Duration = gc2.Description,
                                           Status = "",
                                           CreatedOn = s.CreatedOn
                                       }
                                      ).FirstOrDefaultAsync();
            return leaveResponse;
        }
    }
}
