using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TT.Camp.Common.Requests;
using TT.Camp.Common.Responses;
using TT.Camp.Core.Entities;

namespace TT.Camp.Data.Repository.IRepository
{
    public interface ITenantRepository : IBaseRepository<Tenant>
    {
        Task<Tenant> getTenantDetails(string host);
    }
}
