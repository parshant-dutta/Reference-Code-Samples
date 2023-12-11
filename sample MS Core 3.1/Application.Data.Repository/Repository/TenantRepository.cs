using Dapper;
using System.Data;
using System.Threading.Tasks;
using TT.Camp.Core.Entities;
using TT.Camp.Data.Repository.IRepository;
using TT.Camp.Data.Repository.UnitOfWork;
using System.Linq;

namespace TT.Camp.Data.Repository.Repository
{
    public class TenantRepository : BaseRepository<Tenant>, ITenantRepository
    {

        public TenantRepository(IUnitOfWork unitOfWork) : base(unitOfWork)
        {

        }
      
        public async Task<Tenant> getTenantDetails(string host)
        {
            string query = "select APIKey FROM tenants WHERE Url=@tenanturl";
            var tenant =await QueryAsync(query, new { tenanturl = host });
            return tenant.FirstOrDefault();
        }
    }
}
