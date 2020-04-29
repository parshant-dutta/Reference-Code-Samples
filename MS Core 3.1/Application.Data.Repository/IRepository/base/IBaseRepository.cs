using Dapper;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace TT.Camp.Data.Repository.IRepository
{
    public interface IBaseRepository<T>
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task DeleteRowAsync(int id);
        Task<T> GetAsync(int id);
        Task<T> GetAsync(string query, object parameters);
        Task<int> SaveRangeAsync(IEnumerable<T> list);
        Task<int> UpdateAsync(T t);
        Task<int> InsertAsync(T t);
        Task<IEnumerable<T>> QueryAsync(string query, object parameters);
        Task<bool> QueryScalarAsync(string query, object parameters);
        Task<object> GetSpAsync(string query, DynamicParameters parameters);
    }
}
