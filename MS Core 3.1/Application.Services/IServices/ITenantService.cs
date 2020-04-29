using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TT.Camp.Core.Entities;
using TT.Camp.Common.Requests;
using TT.Camp.Common.Responses;

namespace TT.Camp.Services.IServices
{
    public interface ITenantService
    {
        Task<Tenant> GetCurrentTenant(string host);
    }
}
