using DitsPortal.Common.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DitsPortal.DataAccess.IRepositories
{
    public interface IBaseRepository<T> where T : class
    {
        T Get<Tkey>(int id);
        IQueryable<T> GetAll();
        T Add(T entity);
        T Update(T entity);
        T GetSingle(Expression<Func<T, bool>> whereCondition);
        List<T> GetAll(Expression<Func<T, bool>> whereCondition);
        List<T> GetRecordsWithFilters(int page = 1, int limit = 10, string orderBy = "CreatedOn", bool orderByDescending = true, bool AllRecords = false);
        List<T> GetRecordsWithFilters(int page = 1, int limit = 10, string orderBy = "CreatedOn", bool orderByDescending = true, bool AllRecords = false, Expression<Func<T, bool>> whereCondition = null);
        //List<T> GetFiltersRecord(int page = 1, int limit = 10, string orderBy = "CreatedOn", string filterBy="CreatedDate",  bool orderByDescending = true, bool AllRecords = false, Expression<Func<T, bool>> whereCondition = null);
        void Delete(T entity);
        Task<T> AddAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task<BooleanResponse> DeleteRecord(string TableName, int Id, string DeletedBy);
        Task<BooleanResponse> UpdatActiveStaus(string TableName, bool IsActive, int Id, string Modifiedby);
        //Task<BooleanResponse> GetGlobalCodePermissions(string TableName,  int Id);
        int GetTotalCount();
        int GetTotalCount(Expression<Func<T, bool>> whereCondition);
        

    }
}
