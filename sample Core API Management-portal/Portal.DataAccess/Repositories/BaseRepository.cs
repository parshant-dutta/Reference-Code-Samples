//using DitsPortal.DataAccess.Data;
using DitsPortal.Common.Responses;
using DitsPortal.DataAccess.IRepositories;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DitsPortal.DataAccess.Repositories
{
    public class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        private readonly DbContext _dbContext;
        protected DbSet<T> DbSet;
        public BaseRepository(DbContext dbContext)
        {
            _dbContext = dbContext;
            DbSet = _dbContext.Set<T>();
        }
        public T Add(T entity)
        {
            _dbContext.Set<T>().Add(entity);
            int result = Save();
            if (result > 0)
                return entity;
            else
                return null;
        }

        public void Delete(T entity)
        {
            _dbContext.Entry(entity).State = EntityState.Deleted;
            Save();
        }

        public T Get<Tkey>(int id)
        {
            return DbSet.Find(id);
        }

        public IQueryable<T> GetAll()
        {
            return DbSet;
        }

        public List<T> GetAll(Expression<Func<T, bool>> whereCondition)
        {
            return DbSet.Where(whereCondition).ToList<T>();
        }

        public T GetSingle(Expression<Func<T, bool>> whereCondition)
        {
            return DbSet.Where(whereCondition).FirstOrDefault<T>();
        }

        public T Update(T entity)
        {
            _dbContext.Entry(entity).State = EntityState.Modified;
            int result = Save();
            if (result > 0)
                return entity;
            else
                return null;
        }
        private int Save()
        {
            int result = _dbContext.SaveChanges();
            return result;
        }

        public async Task<T> AddAsync(T entity)
        {
            _dbContext.Set<T>().Add(entity);
            int result = await SaveAsync();
            if (result > 0)
                return entity;
            else
                return null;
        }

        public async Task<T> UpdateAsync(T entity)
        {
            _dbContext.Entry(entity).State = EntityState.Modified;
            int result = await SaveAsync();
            if (result > 0)
                return entity;
            else
                return null;
        }

        private async Task<int> SaveAsync()
        {
            int result = await _dbContext.SaveChangesAsync();
            return result;
        }
        public async Task<BooleanResponse> DeleteRecord(string TableName, int Id, string DeletedBy)
        {
            MySqlParameter[] parameter = {
                new MySqlParameter("@tablename", TableName),
                new MySqlParameter("@id", Id),
                new MySqlParameter("@deletedby", DeletedBy)
            };
            BooleanResponse BooleanResponse =  await _dbContext.Query<BooleanResponse>().AsNoTracking().FromSql("call sp_DeleteRecord(@tablename, @id, @deletedby)", parameter).FirstOrDefaultAsync();
            return BooleanResponse;
        }
        public async Task<BooleanResponse> UpdatActiveStaus(string TableName,bool IsActive ,int Id, string Modifiedby)
        {
            MySqlParameter[] parameter = {
                new MySqlParameter("@tablename", TableName),
                new MySqlParameter("@active", IsActive),
                new MySqlParameter("@id", Id),
                new MySqlParameter("@modifiedby", Modifiedby)
            };
            BooleanResponse BooleanResponse = await _dbContext.Query<BooleanResponse>().AsNoTracking().FromSql("call sp_UpdatActiveStaus(@tablename, @active,@id, @modifiedby)", parameter).FirstOrDefaultAsync();
            return BooleanResponse;
        }
        ////public async Task<BooleanResponse> GetGlobalCodePermissions(string TableName, int Id )
        ////{
        ////    MySqlParameter[] parameter = {
        ////        new MySqlParameter("@tablename", TableName),
        ////        new MySqlParameter("@id", Id)
                
        ////    };
        //    BooleanResponse BooleanResponse = await _dbContext.Query<BooleanResponse>().AsNoTracking().FromSql("call sp_GetGlobalCodePermission(@tablename,@id )", parameter).FirstOrDefaultAsync();
        //    return BooleanResponse;
        //}

        public int GetTotalCount()
        {
            return DbSet.Count();
        }

        public int GetTotalCount(Expression<Func<T, bool>> whereCondition)
        {
            return DbSet.Count(whereCondition);
        }

        public List<T> GetRecordsWithFilters(int page, int limit, string orderBy, bool orderByDescending,  bool AllRecords)
        {
            orderBy = orderBy ?? "CreatedOn";
            IQueryable<T> dbSet;
            if (orderByDescending)
            {
                dbSet = DbSet.OrderByDescending(p => EF.Property<T>(p, orderBy));
            }
            else
            {
                dbSet = DbSet.OrderBy(p => EF.Property<T>(p, orderBy));
            }
            if (AllRecords)
            {
                return DbSet.ToList<T>();
            }
            else
            {
                return dbSet.Skip((page - 1) * limit).Take(limit).ToList<T>();
            }
        }

        public List<T> GetRecordsWithFilters(int page, int limit, string orderBy, bool orderByDescending, bool AllRecords, Expression<Func<T, bool>> whereCondition)
        {
            var dbSet = DbSet.Where(whereCondition);
            orderBy = orderBy ?? "CreatedOn";
            if (orderByDescending)
            {
                dbSet = dbSet.OrderByDescending(p => EF.Property<T>(p, orderBy));
            }
            else
            {
                dbSet = dbSet.OrderBy(p => EF.Property<T>(p, orderBy));
            }
            if (AllRecords)
            {
                return dbSet.ToList<T>();
            }
            else
            {
                return dbSet.Skip((page - 1) * limit).Take(limit).ToList<T>();
            }
        }

    }
}
